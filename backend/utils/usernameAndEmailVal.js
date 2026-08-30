import validator from "validator";

const usernameRegEx = /^[a-zA-Z0-9]+([.-][a-zA-Z0-9]+)*$/;

export function validateUsername(req, res, next) {
  const { username } = req.query;
  const errors = [];

  if (!username) {
    return res.status(400).json({ errors: "Username is required" });
  }

  if (!validator.isLength(username, { min: 3, max: 30 })) {
    errors.push("Username must be 3-30 characters");
  }

  if (!usernameRegEx.test(username)) {
    errors.push(
      "Username can only contain letters, numbers, and . or - in the middle",
    );
  }

  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }

  next();
}

export function validateEmail(req, res, next) {
  const { email } = req.query;
  const errors = [];

  if (!email) {
    return res.status(400).json({ errors: "Email is required" });
  }

  if (!validator.isEmail(email)) {
    errors.push("Invalid email address");
  }

  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }

  next();
}
