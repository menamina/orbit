import validator from "validator";

export function passwordValidator(req, res, next) {
  const { password, confirmPassword } = req.body;

  const errors = [];

  if (!validator.isLength(password, { min: 8 })) {
    errors.push("Password must be at least 8 characters");
  }

  if (password !== confirmPassword) {
    errors.push("Passwords must match");
  }

  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }

  next();
}
