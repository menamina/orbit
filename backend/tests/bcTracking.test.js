import { jest, describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import app from "../server.js";
import supertest from "supertest";
const request = supertest(app);
const agent = supertest.agent(app);
import prisma from "../prisma/client.js";
import { passwordGenie } from "../utils/passwordUtil.js";

jest.setTimeout(5500);

let user;
let pill;
let pack;

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

describe("birth control api", () => {
  it("creates a new pill pack", async () => {
    const res = await agent.post(`/api/blister-packs`);

    pack = res.body.id;

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("id");
    expect(res.body).toHaveProperty("packNumber");
  });

  it("posts birth control pill", async () => {
    const res = await agent.post(`/api/track-pill/${pack}`).send({
      dayNumber: 1,
      date: Date.now(),
    });

    pill = res.body.id;

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("id");
    expect(res.body).toHaveProperty("date");
  });

  it("does not post birth control pill if the date is greater than today's date", async () => {
    const res = await agent.post(`/api/track-pill/${pack}`).send({
      dayNumber: 2,
      date: new Date("2027-08-07").getTime(),
    });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("error");
  });

  it("prevents duplicate pill tracking on the same date", async () => {
    const date = Date.now();
    const res1 = await agent.post(`/api/track-pill/${pack}`).send({ dayNumber: 3, date });
    expect(res1.status).toBe(200);

    const res2 = await agent.post(`/api/track-pill/${pack}`).send({ dayNumber: 3, date });
    expect(res2.status).toBe(400);
    expect(res2.body).toHaveProperty("error");
    expect(res2.body.error).toContain("already tracked");

    await agent.delete(`/api/dltPill/${res1.body.id}`);
  });

  it("rejects invalid date format", async () => {
    const res = await agent.post(`/api/track-pill/${pack}`).send({
      dayNumber: 4,
      date: "not-a-date",
    });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("error");
  });

  it("rejects pill tracking without date", async () => {
    const res = await agent.post(`/api/track-pill/${pack}`).send({ dayNumber: 5 });

    expect(res.status).toBe(400);
    expect(res.body.error).toContain("Date is required");
  });

  it("gets current pill pack", async () => {
    const res = await agent.get(`/api/pill-pack/current`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("id");
    expect(Array.isArray(res.body.pills)).toBe(true);
  });

  it("returns error when deleting non-existent pill", async () => {
    const res = await agent.delete(`/api/dltPill/999999`);

    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty("error");
  });

  it("prevents deleting another user's pill", async () => {
    const otherUser = await createTestUser(
      "other",
      "other@test.com",
      "password123",
    );

    const otherPack = await prisma.pillPack.create({
      data: {
        userID: otherUser.id,
        packNumber: 1,
      },
    });

    const otherPill = await prisma.pillTracking.create({
      data: {
        pillPackID: otherPack.id,
        dayNumber: 1,
        date: new Date("2026-08-08"),
      },
    });

    const res = await agent.delete(`/api/dltPill/${otherPill.id}`);

    expect(res.status).toBe(400);
    expect(res.body.error).toContain("Not authorized");

    await dlt(otherUser.id);
  });

  it("deletes birth control pill", async () => {
    const res = await agent.delete(`/api/dltPill/${pill}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("success");
  });
});
