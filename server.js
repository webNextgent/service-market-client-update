/* eslint-disable no-unused-vars */
import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync, existsSync, statSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = 4000;

const distPath = join(__dirname, 'dist');

// Custom middleware to handle both static files and SPA routing
app.use((req, res, next) => {
  // Skip root path - serve index.html directly
  if (req.path === '/') {
    return serveIndexHtml(res);
  }
  
  const requestedPath = join(distPath, req.path);
  
  // Check if the requested file exists and is a file (not a directory)
  if (existsSync(requestedPath) && statSync(requestedPath).isFile()) {
    // File exists, serve it using express.static
    return express.static(distPath)(req, res, () => {
      // If express.static couldn't serve it for some reason, serve index.html
      serveIndexHtml(res);
    });
  }
  
  // File doesn't exist, serve index.html for SPA routing
  serveIndexHtml(res);
});

function serveIndexHtml(res) {
  try {
    const indexPath = join(distPath, 'index.html');
    
    if (!existsSync(indexPath)) {
      return res.status(404).send('index.html not found. Please build the project first.');
    }
    
    const indexContent = readFileSync(indexPath, 'utf-8');
    res.setHeader('Content-Type', 'text/html');
    res.send(indexContent);
  } catch (error) {
    console.error('Error serving index.html:', error);
    res.status(500).send('Error loading index.html');
  }
}

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on http://0.0.0.0:${PORT}`);
});
