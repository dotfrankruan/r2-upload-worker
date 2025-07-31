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
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>R2 Upload</title>
  <link href="https://fonts.googleapis.com/css?family=Material+Icons|Material+Icons+Outlined" rel="stylesheet">
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gray-100 flex items-center justify-center h-screen">
  <div class="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
    <h2 class="text-2xl font-bold text-center text-gray-900">Upload a File to R2</h2>
    <form id="upload-form" class="space-y-6">
      <div>
        <label for="file-upload" class="block text-sm font-medium text-gray-700">Choose file</label>
        <div class="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
          <div class="space-y-1 text-center">
            <svg class="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
              <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
            <div class="flex text-sm text-gray-600">
              <label for="file-upload" class="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500">
                <span>Upload a file</span>
                <input id="file-upload" name="file-upload" type="file" class="sr-only" accept="image/jpeg,image/png,image/gif,image/tiff,image/vnd.adobe.photoshop,image/heif,image/heic,image/avif">
              </label>
              <p class="pl-1">or drag and drop</p>
            </div>
            <p class="text-xs text-gray-500">JPG, PNG, GIF, TIFF, PSD, HEIF, HEIC, AVIF</p>
          </div>
        </div>
      </div>
      <div>
        <button type="submit" class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
          Upload
        </button>
      </div>
    </form>
    <div id="status" class="text-center"></div>
  </div>
  <script>
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
