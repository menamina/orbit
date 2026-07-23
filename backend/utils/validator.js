const validator = require("validator");

exports.validateSignup = (req, res, next) => {
  const { email, password, password_confirm, username, name } = req.body;
  if (!email || !password || !password_confirm || !username) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  if (!validator.isEmail(email)) {
    return res.status(400).json({ error: "Invalid email address" });
  }

  if (!validator.isLength(username, { min: 3 })) {
    return res.status(400).json({ error: "Username must be 3-20 characters" });
  }

  if (!validator.isAlphanumeric(username, "en-US", { ignore: "_" })) {
    return res.status(400).json({
      error: "Username can only contain letters, numbers, and underscores",
    });
  }

  if (!validator.isLength(password, { min: 8 })) {
    return res
      .status(400)
      .json({ error: "Password must be at least 8 characters" });
  }

  if (password !== password_confirm) {
    return res.status(400).json({ error: "Passwords do not match" });
  }

  if (name && !validator.isLength(name, { min: 2, max: 50 })) {
    return res.status(400).json({ error: "Name must be 2-50 characters" });
  }

  next();
};
