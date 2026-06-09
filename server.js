const express = require('express');
const path = require('path');

const app = express();
const PORT = 3000;

// Serve static files (HTML, CSS, JS)
app.use(express.static(path.join(__dirname)));

// Route utama
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Handle 404
app.use((req, res) => {
  res.status(404).send('File not found');
});

// Start server
app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════╗
║   Portfolio Builder Server Started!    ║
║                                        ║
║   🌐 Open: http://localhost:${PORT}         ║
║   📁 Folder: ${path.join(__dirname).split(path.sep).pop()}              ║
║                                        ║
║   Press Ctrl+C to stop server          ║
╚════════════════════════════════════════╝
  `);
});
