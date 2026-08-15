import prisma from "../prisma/client.js";

async function getNotes(req, res) {
  try {
    const userID = Number(req.user.userID);
    const month = Number(req.params);
    const year = Number(req.params);

    const startOfMonth = new Date(year, month - 1, 1);
    const startOfNextMonth = new Date(year, month, 1);

    const usersNotes = await prisma.notes.findMany({
      where: {
        userID,
        date: {
          gte: startOfMonth,
          lt: startOfNextMonth,
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
    const { note, date } = req.body;

    const newNote = await prisma.notes.create({
      data: {
        userID,
        note,
        ...(date && { date: new Date(date) }),
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
    const noteContent = req.body.note;

    const existingNote = await prisma.notes.findUnique({
      where: { id: noteID },
    });

    if (!existingNote) {
      return res.status(404).json({ error: "Note not found" });
    }

    if (existingNote.userID !== userID) {
      return res.status(403).json({ error: "Not authorized" });
    }

    const updatedNote = await prisma.notes.update({
      where: { id: noteID },
      data: {
        note: noteContent,
      },
    });

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

    const existingNote = await prisma.notes.findUnique({
      where: { id: noteID },
    });

    if (!existingNote) {
      return res.status(404).json({ error: "Note not found" });
    }

    if (existingNote.userID !== userID) {
      return res.status(403).json({ error: "Not authorized" });
    }

    await prisma.notes.delete({
      where: { id: noteID },
    });

    return res.status(200).json({ success: true });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ serverError: "Server error" });
  }
}

export { getNotes, writeNote, updateNote, dltNote };
