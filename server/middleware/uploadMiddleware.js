const multer = require('multer');

// Store file in memory only — no temp files written to disk (SEC2-008)
const storage = multer.memoryStorage();

// Enforce file size limit at HTTP layer before any parsing (SEC2-004)
// 20 rows × ~200 bytes per row + header ≈ ~5KB; 1MB is a generous hard cap
const upload = multer({
  storage,
  limits: { fileSize: 1 * 1024 * 1024 } // 1MB
});

module.exports = upload.single('file');
