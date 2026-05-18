const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary');

const makeCloudinaryStorage = (folder) =>
  new CloudinaryStorage({
    cloudinary,
    params: {
      folder,
      allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
      resource_type: 'image',
      // auto quality + format for optimal delivery
      transformation: [{ quality: 'auto', fetch_format: 'auto' }],
    },
  });

// Labour CNIC documents
const cnicStorage = makeCloudinaryStorage('khoojlocal/labour/cnic');
// Labour selfie
const selfieStorage = makeCloudinaryStorage('khoojlocal/labour/selfie');

// Field-aware storage router
const fieldStorage = {
  cnicFront: cnicStorage,
  cnicBack: cnicStorage,
  selfie: selfieStorage,
};

const fileFilter = (req, file, cb) => {
  const allowed = /jpeg|jpg|png|webp/;
  if (allowed.test(file.mimetype)) return cb(null, true);
  cb(new Error('Only JPEG, JPG, PNG, and WebP images are allowed'));
};

// Multer instance that picks storage based on field name
const labourDocumentUpload = multer({
  storage: {
    // multer calls _handleFile / _removeFile on the storage object
    _handleFile(req, file, cb) {
      const storage = fieldStorage[file.fieldname];
      if (!storage) return cb(new Error(`Invalid field: ${file.fieldname}`));
      storage._handleFile(req, file, cb);
    },
    _removeFile(req, file, cb) {
      const storage = fieldStorage[file.fieldname];
      if (storage) storage._removeFile(req, file, cb);
      else cb(null);
    },
  },
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter,
}).fields([
  { name: 'cnicFront', maxCount: 1 },
  { name: 'cnicBack', maxCount: 1 },
  { name: 'selfie', maxCount: 1 },
]);

// Generic single-file upload to a given folder (used by verifyCnicRoute etc.)
const upload = (folder = 'khoojlocal/misc') =>
  multer({
    storage: makeCloudinaryStorage(folder),
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter,
  });

module.exports = { labourDocumentUpload, upload };
