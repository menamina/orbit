import bcrypt from "bcrypt";

async function passwordGenie(password) {
  const rounds = 15;
  const saltedHash = await bcrypt.hash(password, rounds);
  return saltedHash;
}

async function checkPassword(password, usersSaltedHash) {
  const match = await bcrypt.compare(password, usersSaltedHash);
  return match;
}

module.exports = {
  passwordGenie,
  checkPassword,
};
