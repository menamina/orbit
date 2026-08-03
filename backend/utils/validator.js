import validator from "validator";
const usernameRegEx = /^[a-zA-Z0-9]+([.-][a-zA-Z0-9]+)*$/;

exports.validateSignup = (req, res, next) => {
  const { email, password, password_confirm, username, name } = req.body;
  const errors = [];

  if (!email || !password || !password_confirm || !username) {
    return res.status(400).json({ errors: ["Missing required fields"] });
  }

  if (!validator.isEmail(email)) {
    errors.push("Invalid email address");
  }

  if (!validator.isLength(username, { min: 3, max: 30 })) {
    errors.push("Username must be 3-20 characters");
  }

  if (!usernameRegEx.test(username)) {
    errors.push(
      "Username can only contain letters, numbers, and . or - in the middle",
    );
  }

  if (!validator.isLength(password, { min: 8 })) {
    errors.push("Password must be at least 8 characters");
  }

  if (password !== password_confirm) {
    errors.push("Passwords do not match");
  }

  if (name && !validator.isLength(name, { min: 2, max: 50 })) {
    errors.push("Name must be 2-50 characters");
  }

  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }

  next();
};
