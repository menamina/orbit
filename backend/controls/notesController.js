import prisma from "../prisma/client.js";

async function getDatesNote(req, res) {
  try {
    const userID = Number(req.user.userID);
    const dateString = req.params.date;

    if (!dateString) {
      return res.status(400).json({ error: "Date is required" });
    }

    // Parse date as YYYY-MM-DD and create UTC midnight
    const [year, month, day] = dateString.split('-').map(Number);
    if (!year || !month || !day) {
      return res.status(400).json({ error: "Invalid date format. Use YYYY-MM-DD" });
    }

    const date = new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0));
    console.log("getDatesNote - dateString:", dateString, "parsed date:", date.toISOString());

    const note = await prisma.notes.findFirst({
      where: {
        userID,
        date,
      },
    });

    if (!note) {
      console.log("No note found for date:", date.toISOString());
      const noNote = [];
      return res.status(200).json(noNote);
    }
    console.log("Found note - id:", note.id, "date in DB:", note.date);
    return res.status(200).json(note);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Server error" });
  }
}

async function getNotes(req, res) {
  try {
    const userID = Number(req.user.userID);
    const month = Number(req.params.month);
    const year = Number(req.params.year);

    if (isNaN(month) || month < 1 || month > 12) {
      return res.status(400).json({ error: "Invalid month" });
    }

    if (isNaN(year) || year < 2000 || year > 2100) {
      return res.status(400).json({ error: "Invalid year" });
    }

    const startOfMonth = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0, 0));
    const startOfNextMonth = new Date(Date.UTC(year, month, 1, 0, 0, 0, 0));

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
    return res.status(500).json({ error: "Server error" });
  }
}

async function writeNote(req, res) {
  try {
    const userID = Number(req.user.userID);
    const { note, date } = req.body;

    console.log("writeNote called - userID:", userID, "date:", date, "note length:", note?.length);

    if (!note || note.trim().length === 0) {
      return res.status(400).json({ error: "Note content is required" });
    }

    let noteDate = null;
    if (date) {
      // Parse date as YYYY-MM-DD and create UTC midnight
      const [year, month, day] = date.split('-').map(Number);
      if (!year || !month || !day) {
        return res.status(400).json({ error: "Invalid date format. Use YYYY-MM-DD" });
      }

      noteDate = new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0));
      console.log("Parsed date:", noteDate.toISOString());

      // Prevent creating notes for future dates
      const today = new Date();
      today.setUTCHours(0, 0, 0, 0);
      if (noteDate > today) {
        return res.status(400).json({ error: "Cannot create notes for future dates" });
      }
    }

    const newNote = await prisma.notes.create({
      data: {
        userID,
        note,
        ...(noteDate && { date: noteDate }),
      },
    });

    console.log("Note created successfully - id:", newNote.id, "date in DB:", newNote.date, "original dateString:", date);
    return res.status(200).json(newNote);
  } catch (error) {
    console.log("Error in writeNote:", error);
    return res.status(500).json({ error: "Server error" });
  }
}

async function updateNote(req, res) {
  try {
    const userID = Number(req.user.userID);
    const noteID = Number(req.body.noteID);
    const noteContent = req.body.note;

    if (isNaN(noteID) || noteID <= 0) {
      return res.status(400).json({ error: "Invalid note ID" });
    }

    if (!noteContent || noteContent.trim().length === 0) {
      return res.status(400).json({ error: "Note content is required" });
    }

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
    return res.status(500).json({ error: "Server error" });
  }
}

async function dltNote(req, res) {
  try {
    const userID = Number(req.user.userID);
    const noteID = Number(req.body.noteID);

    if (isNaN(noteID) || noteID <= 0) {
      return res.status(400).json({ error: "Invalid note ID" });
    }

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
    return res.status(500).json({ error: "Server error" });
  }
}

export { getDatesNote, getNotes, writeNote, updateNote, dltNote };
