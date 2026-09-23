const { sendError } = require('../utils/response');

const validate = (schema) => {
  return (req, res, next) => {
    // A simple custom validator that iterates over schema rules
    // Schema format: { field: [rule1, rule2] }
    // Since we don't have joi/yup, we'll implement simple rules here or use the validators.js
    
    // For simplicity, we can just rely on controllers/services for detailed validation 
    // or implement a basic required check here.
    
    for (const [field, rules] of Object.entries(schema)) {
      if (rules.includes('required') && (req.body[field] === undefined || req.body[field] === null || req.body[field] === '')) {
        return sendError(res, 422, `Field ${field} is required`);
      }
    }
    
    next();
  };
};

module.exports = { validate };
