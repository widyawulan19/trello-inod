// upload.js
const multer = require('multer');

const upload = multer({ storage: multer.memoryStorage() });

module.exports = upload;

// // upload.js
// const multer = require('multer');
// const { storage } = require('./CloudinaryConfig'); // pastikan nama file kecil semua

// const upload = multer({ storage });

// module.exports = upload;
