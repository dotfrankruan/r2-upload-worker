export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (request.method === 'POST' && url.pathname === '/upload') {
      const formData = await request.formData();
      const file = formData.get('file');

      if (!file) {
        return new Response('File not found', { status: 400 });
      }

      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/tiff', 'image/psd', 'image/heif', 'image/heic', 'image/avif'];
      if (!allowedTypes.includes(file.type)) {
        return new Response('Invalid file type', { status: 400 });
      }

      const date = new Date();
      const year = date.getFullYear();
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const day = date.getDate().toString().padStart(2, '0');
      const randomString = crypto.randomUUID();
      const fileExtension = file.name.split('.').pop();
      const fileName = `${year}${month}${day}_${randomString}.${fileExtension}`;

      await env.MY_BUCKET.put(fileName, file.stream(), {
        httpMetadata: { contentType: file.type },
      });

      return new Response(`File ${fileName} uploaded successfully!`);
    }

    if (url.pathname === '/') {
      return new Response(html, {
        headers: {
          'content-type': 'text/html;charset=UTF-8',
        },
      });
    }

    return new Response('Not found', { status: 404 });
  },
};

const html = `
<!DOCTYPE html>
<html lang="en" class="">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>R2 Upload</title>
  <link href="https://fonts.googleapis.com/css?family=Material+Icons|Material+Icons+Outlined" rel="stylesheet">
  <script src="https://cdn.tailwindcss.com"></script>
  <script>
    tailwind.config = {
      darkMode: 'class',
    }
  </script>
  <style>
    :root {
      --bg-light: #f0f2f5;
      --card-bg-light: #ffffff;
      --text-primary-light: #1f2937;
      --text-secondary-light: #4b5563;
      --input-border-light: #e0e0e0;
      --button-primary-bg-light: #5856d6;
      --button-primary-hover-bg-light: #3d3ca7;

      --bg-dark: #1c1c1e;
      --card-bg-dark: #2c2c2e;
      --text-primary-dark: #f2f2f7;
      --text-secondary-dark: #aeaeb2;
      --input-border-dark: #48484a;
      --button-primary-bg-dark: #5e5ce6;
      --button-primary-hover-bg-dark: #4947d1;
    }
    body {
      background-color: var(--bg-light);
      transition: background-color 0.3s ease;
    }
    .dark body {
      background-color: var(--bg-dark);
    }
    .card {
      background-color: var(--card-bg-light);
      transition: background-color 0.3s ease, box-shadow 0.3s ease;
    }
    .dark .card {
      background-color: var(--card-bg-dark);
    }
    .text-primary {
      color: var(--text-primary-light);
      transition: color 0.3s ease;
    }
    .dark .text-primary {
      color: var(--text-primary-dark);
    }
    .text-secondary {
      color: var(--text-secondary-light);
      transition: color 0.3s ease;
    }
    .dark .text-secondary {
      color: var(--text-secondary-dark);
    }
    .upload-button {
      background-color: var(--button-primary-bg-light);
      transition: background-color 0.3s ease;
    }
    .dark .upload-button {
      background-color: var(--button-primary-bg-dark);
    }
    .upload-button:hover {
      background-color: var(--button-primary-hover-bg-light);
    }
    .dark .upload-button:hover {
      background-color: var(--button-primary-hover-bg-dark);
    }
    .drop-zone {
      border-color: var(--input-border-light);
      transition: border-color 0.3s ease;
    }
    .dark .drop-zone {
      border-color: var(--input-border-dark);
    }
  </style>
</head>
<body class="flex items-center justify-center h-screen">
  <div class="absolute top-4 right-4">
    <button id="theme-toggle" class="text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-4 focus:ring-gray-200 dark:focus:ring-gray-700 rounded-lg text-sm p-2.5">
      <svg id="theme-toggle-dark-icon" class="hidden w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z"></path></svg>
      <svg id="theme-toggle-light-icon" class="hidden w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 5.05A1 1 0 003.636 6.464l.707.707a1 1 0 001.414-1.414l-.707-.707zM3 11a1 1 0 100-2H2a1 1 0 100 2h1zM6.464 14.364a1 1 0 00-1.414 1.414l.707.707a1 1 0 001.414-1.414l-.707-.707z"></path></svg>
    </button>
  </div>
  <div class="card w-full max-w-md p-8 space-y-6 rounded-lg shadow-md">
    <h2 class="text-2xl font-bold text-center text-primary">Upload a File to R2</h2>
    <form id="upload-form" class="space-y-6">
      <div>
        <label for="file-upload" class="block text-sm font-medium text-secondary">Choose file</label>
        <div class="drop-zone mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-md">
          <div class="space-y-1 text-center">
            <svg class="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
              <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
            <div class="flex text-sm text-gray-600 dark:text-gray-400">
              <label for="file-upload" class="relative cursor-pointer bg-white dark:bg-gray-800 rounded-md font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500 dark:focus-within:ring-indigo-400">
                <span>Upload a file</span>
                <input id="file-upload" name="file-upload" type="file" class="sr-only" accept="image/jpeg,image/png,image/gif,image/tiff,image/vnd.adobe.photoshop,image/heif,image/heic,image/avif">
              </label>
              <p class="pl-1">or drag and drop</p>
            </div>
            <p class="text-xs text-gray-500 dark:text-gray-400">JPG, PNG, GIF, TIFF, PSD, HEIF, HEIC, AVIF</p>
          </div>
        </div>
      </div>
      <div>
        <button type="submit" class="upload-button w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
          Upload
        </button>
      </div>
    </form>
    <div id="status" class="text-center text-secondary"></div>
  </div>
  <script>
    const themeToggleDarkIcon = document.getElementById('theme-toggle-dark-icon');
    const themeToggleLightIcon = document.getElementById('theme-toggle-light-icon');

    // Change the icons inside the button based on previous settings
    if (localStorage.getItem('color-theme') === 'dark' || (!('color-theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        themeToggleLightIcon.classList.remove('hidden');
        document.documentElement.classList.add('dark');
    } else {
        themeToggleDarkIcon.classList.remove('hidden');
        document.documentElement.classList.remove('dark');
    }

    const themeToggleBtn = document.getElementById('theme-toggle');

    themeToggleBtn.addEventListener('click', function() {
        // toggle icons inside button
        themeToggleDarkIcon.classList.toggle('hidden');
        themeToggleLightIcon.classList.toggle('hidden');

        // if set via local storage previously
        if (localStorage.getItem('color-theme')) {
            if (localStorage.getItem('color-theme') === 'light') {
                document.documentElement.classList.add('dark');
                localStorage.setItem('color-theme', 'dark');
            } else {
                document.documentElement.classList.remove('dark');
                localStorage.setItem('color-theme', 'light');
            }

        // if NOT set via local storage previously
        } else {
            if (document.documentElement.classList.contains('dark')) {
                document.documentElement.classList.remove('dark');
                localStorage.setItem('color-theme', 'light');
            } else {
                document.documentElement.classList.add('dark');
                localStorage.setItem('color-theme', 'dark');
            }
        }
    });

    const form = document.getElementById('upload-form');
    const fileInput = document.getElementById('file-upload');
    const statusDiv = document.getElementById('status');

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const file = fileInput.files[0];
      if (!file) {
        statusDiv.textContent = 'Please select a file.';
        return;
      }

      const formData = new FormData();
      formData.append('file', file);

      statusDiv.textContent = 'Uploading...';

      try {
        const response = await fetch('/upload', {
          method: 'POST',
          body: formData,
        });

        const result = await response.text();
        statusDiv.textContent = result;
      } catch (error) {
        statusDiv.textContent = 'Upload failed: ' + error.message;
      }
    });
  </script>
</body>
</html>
`;
