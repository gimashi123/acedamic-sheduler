const multerErrorHandler = (err, req, res, next) => {
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({
      message: 'File size too large. Maximum size is 5MB'
    });
  }
  
  if (err.message === 'Only image files are allowed!') {
    return res.status(400).json({
      message: err.message
    });
  }
  
  next(err);
};

module.exports = multerErrorHandler; 