const { validationResult } = require('express-validator');

// Middleware to handle validation errors
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // If this is an API request
    if (req.xhr || req.headers.accept.indexOf('json') > -1) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    // For regular form submissions
    req.flash('error_msg', errors.array().map(error => error.msg).join('<br>'));
    return res.redirect('back');
  }
  next();
};

module.exports = { validate };
