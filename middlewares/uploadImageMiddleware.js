const multer = require('multer');
const ApiError = require('../utils/apiError');

exports.uploadSingleImage = (filedName) => {
  const multerStorage = multer.memoryStorage();

  const multerFiliter = function (req, file, cb) {
    //image.
    if (file.mimetype.startsWith('image')) {
      cb(null, true);
    } else {
      cb(new ApiError('Only Image allowed', 400), false);
    }
  };

  const upload = multer({ storage: multerStorage, fileFilter: multerFiliter });

  return upload.single(filedName);
};
