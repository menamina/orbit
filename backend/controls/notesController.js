import prisma from "../../prisma/client";

async function getNotes(req, res) {
  try {
    const userID = Number(req.user.userID);
    const month = Number(req.body.month);
    const year = Number(req.body.year);

    const startOfMonth = new Date(yearNum, monthNum - 1, 1);
    const startOfNextMonth = new Date(yearNum, monthNum, 1);

    const usersNotes = await prisma.notes.findMany({
      where: {
        userID,
        date: {
          gte: startOfMonth,
          lt: startOfMonth,
        },
      },
      orderBy: {
        date: "asc",
      },
    });

    return res.status(200).json(usersNotes);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ serverError: "Server error" });
  }
}

async function writeNote(req, res) {
  try {
    const userID = Number(req.user.userID);
    const note = req.body.note;

    const newNote = await prisma.notes.create({
      where: {
        userID,
      },
      data: {
        note,
      },
    });

    return res.status(200).json(newNote);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ serverError: "Server error" });
  }
}

async function updateNote(req, res) {
  try {
    const userID = Number(req.user.userID);
    const noteID = Number(req.body.noteID);
    const note = req.body.note;

    const updatedNote = await prisma.note.update({
      where: {
        noteID,
      },
    });

    if (note.userID !== userID) {
      return res.status(403).json({ error: "Not authorized" });
    }

    return res.status(200).json(updatedNote);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ serverError: "Server error" });
  }
}

async function dltNote(req, res) {
  try {
    const userID = Number(req.user.userID);
    const noteID = Number(req.body.noteID);
    const note = req.body.note;

    const noteToDelete = await prisma.note.update({
      where: {
        noteID,
      },
    });

    if (note.userID !== userID) {
      return res.status(403).json({ error: "Not authorized" });
    }
    return res.status(200).json({ success: true });
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
