# r2-upload-worker

A Cloudflare Worker for uploading files to R2 Storage.

## Getting Started

### Prerequisites

- Node.js and npm
- A Cloudflare account with R2 enabled
- `wrangler` CLI tool

### Installation

Install dependencies:
```sh
npm install
```

### Configuration

Update `wrangler.toml` with your Cloudflare account and R2 bucket details.

### Usage

To run the worker locally for development:

```sh
npm start
```

To deploy the worker to Cloudflare:

```sh
npm run deploy
