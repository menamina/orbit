import prisma from "../../prisma/client";

async function getNotes(req, res) {
  try {
    const userID = Number(req.user.userID);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ serverError: "Server error" });
  }
}

async function writeNote(req, res) {
  try {
    const userID = Number(req.user.userID);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ serverError: "Server error" });
  }
}

async function updateNote(req, res) {
  try {
    const userID = Number(req.user.userID);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ serverError: "Server error" });
  }
}

async function dltNote(req, res) {
  try {
    const userID = Number(req.user.userID);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ serverError: "Server error" });
  }
}

module.exports = {
  getNotes,
  writeNote,
  updateNote,
  dltNote,
};
