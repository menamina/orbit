const { body, validationResult } = require("express-validator");

const validation = [
  body("name").trim().notEmpty().withMessage("Name required"),
  body("username")
    .trim()
    .notEmpty()
    .withMessage("Username required")
    .matches(/^[a-zA-Z0-9_-]+$/)
    .withMessage("Username can only contain letters, numbers, _ or -")
    .isLength({ min: 3, max: 30 })
    .withMessage("Username must be between 3 and 30 characters"),
  body("email")
    .trim()
    .notEmpty()
    .withMessage("An email is required")
    .isEmail()
    .withMessage("Valid email required"),
  body("password")
    .trim()
    .notEmpty()
    .withMessage("Password required")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters"),
  body("confirmPassword").custom((value, { req }) => {
    if (value !== req.body.password) {
      throw new Error("Passwords must match");
    }
    return true;
  }),

  (req, res, next) => {
    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }
    return res.status(400).json({ validationErrors: errors.array() });
  },
];

module.exports = validation;
