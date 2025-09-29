const { body, validationResult, query } = require('express-validator');

const validate = (schema) => {
  return async (req, res, next) => {
    await Promise.all(schema.map(validation => validation.run(req)));
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    next();
  };
};

const transactionSchema = [
  body('amount').isFloat({ gt: 0 }).withMessage('Amount must be > 0'),
  body('type').isIn(['income','expense']),
  body('date').optional().isISO8601().toDate(),
  body('categoryId').optional().isInt()
];

module.exports = { validate, transactionSchema };
