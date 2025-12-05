// upload.js
const multer = require('multer');

// const upload = multer({ storage: multer.memoryStorage() });

// Gunakan memoryStorage supaya file bisa langsung di-buffer untuk upload ke Cloudinary
const multer = require('multer');

const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 200 * 1024 * 1024 // Maksimal 200 MB
    }
});

module.exports = upload;


// // upload.js
// const multer = require('multer');
// const { storage } = require('./CloudinaryConfig'); // pastikan nama file kecil semua

// const upload = multer({ storage });

// module.exports = upload;
