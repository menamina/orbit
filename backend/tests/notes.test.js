import { jest, describe, it, expect, beforeAll, afterAll } from "@jest/globals";
import app from "../server.js";
import supertest from "supertest";
const request = supertest(app);
const agent = supertest.agent(app);
import prisma from "../prisma/client.js";
import { passwordGenie } from "../utils/passwordUtil.js";

jest.setTimeout(5500);

let user;
let note;

async function createTestUser(
  username = "orbiter",
  email = "test@gmail.com",
  password = "777IMINHEAVEN",
) {
  const hashedPassword = await passwordGenie(password);
  return await prisma.user.create({
    data: {
      name: "Orbit",
      username,
      email,
      settings: {
        create: {
          saltedHash: hashedPassword,
        },
      },
      accounts: {
        create: {
          provider: "local",
          providerId: email,
        },
      },
    },
  });
}

async function login() {
  return await agent.post("/api/login").send({
    email: "test@gmail.com",
    password: "777IMINHEAVEN",
  });
}

async function logout() {
  await agent.post("/api/logout");
}

async function dlt(userID) {
  await prisma.user.delete({ where: { id: userID } });
}

async function dltAll() {
  await prisma.user.deleteMany({});
}

beforeAll(async () => {
  await dltAll();
  user = await createTestUser();
  await login();
});

afterAll(async () => {
  if (user) {
    await dlt(user.id);
  }
  await prisma.$disconnect();
});

describe("notes api", () => {
  it("gets notes by month and year", async () => {
    const res = await agent.get(`/api/notes/8/2026`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it("creates a note with date", async () => {
    const res = await agent.post(`/api/writeNote`).send({
      note: "This is a test note",
      date: "2026-08-15",
    });

    note = res.body.id;

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("id");
    expect(res.body).toHaveProperty("note");
    expect(res.body.note).toBe("This is a test note");
    expect(res.body).toHaveProperty("date");
  });

  it("creates a note without date", async () => {
    const res = await agent.post(`/api/writeNote`).send({
      note: "Note without specific date",
    });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("id");
    expect(res.body).toHaveProperty("note");
    expect(res.body.note).toBe("Note without specific date");

    await agent.delete(`/api/deleteNote`).send({ noteID: res.body.id });
  });

  it("returns empty array for month with no notes", async () => {
    const res = await agent.get(`/api/notes/12/2025`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(0);
  });

  it("updates an existing note", async () => {
    const res = await agent.patch(`/api/updateNote`).send({
      noteID: note,
      note: "This is an updated test note",
    });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("id");
    expect(res.body.note).toBe("This is an updated test note");
  });

  it("returns 404 when updating non-existent note", async () => {
    const res = await agent.patch(`/api/updateNote`).send({
      noteID: 999999,
      note: "This won't work",
    });

    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty("error");
    expect(res.body.error).toBe("Note not found");
  });

  it("prevents updating another user's note", async () => {
    const otherUser = await createTestUser(
      "other",
      "other@test.com",
      "password123",
    );

    const otherNote = await prisma.notes.create({
      data: {
        userID: otherUser.id,
        note: "Other user's note",
        date: new Date("2026-08-10"),
      },
    });

    const res = await agent.patch(`/api/updateNote`).send({
      noteID: otherNote.id,
      note: "Trying to hack",
    });

    expect(res.status).toBe(403);
    expect(res.body).toHaveProperty("error");
    expect(res.body.error).toBe("Not authorized");

    await dlt(otherUser.id);
  });

  it("returns 404 when deleting non-existent note", async () => {
    const res = await agent.delete(`/api/deleteNote`).send({
      noteID: 999999,
    });

    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty("error");
    expect(res.body.error).toBe("Note not found");
  });

  it("prevents deleting another user's note", async () => {
    const otherUser = await createTestUser(
      "another",
      "another@test.com",
      "password456",
    );

    const otherNote = await prisma.notes.create({
      data: {
        userID: otherUser.id,
        note: "Another user's note",
        date: new Date("2026-08-11"),
      },
    });

    const res = await agent.delete(`/api/deleteNote`).send({
      noteID: otherNote.id,
    });

    expect(res.status).toBe(403);
    expect(res.body).toHaveProperty("error");
    expect(res.body.error).toBe("Not authorized");

    await dlt(otherUser.id);
  });

  it("deletes a note successfully", async () => {
    const res = await agent.delete(`/api/deleteNote`).send({
      noteID: note,
    });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("success");
    expect(res.body.success).toBe(true);
  });

  it("returns notes only for the correct month and year", async () => {
    await agent.post(`/api/writeNote`).send({
      note: "August note",
      date: "2026-08-20",
    });

    await agent.post(`/api/writeNote`).send({
      note: "September note",
      date: "2026-09-20",
    });

    const augustRes = await agent.get(`/api/notes/8/2026`);
    const septemberRes = await agent.get(`/api/notes/9/2026`);

    expect(augustRes.status).toBe(200);
    expect(augustRes.body.length).toBeGreaterThan(0);

    expect(septemberRes.status).toBe(200);
    expect(septemberRes.body.length).toBeGreaterThan(0);

    // Verify the notes are in the correct months
    const augustNotes = augustRes.body.filter((n) => n.note === "August note");
    const septemberNotes = septemberRes.body.filter(
      (n) => n.note === "September note",
    );

    expect(augustNotes.length).toBe(1);
    expect(septemberNotes.length).toBe(1);

    for (const note of augustRes.body) {
      await agent.delete(`/api/deleteNote`).send({ noteID: note.id });
    }
    for (const note of septemberRes.body) {
      await agent.delete(`/api/deleteNote`).send({ noteID: note.id });
    }
  });
});
