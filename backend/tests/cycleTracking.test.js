import { jest, describe, it, expect, beforeAll, afterAll } from "@jest/globals";
import app from "../server.js";
import supertest from "supertest";
const request = supertest(app);
const agent = supertest.agent(app);
import prisma from "../prisma/client.js";
import { passwordGenie } from "../utils/passwordUtil.js";

jest.setTimeout(5500);

let user;

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

describe("getting the cycle by the month and year", () => {
  it("gets users cycle by month and year with valid data", async () => {
    const res = await agent.get(`/api/cycle/${"08"}/${2026}`);

    expect(res.status).toBe(200);
  });

  it("does not get users cycle by month and year with invalid data", async () => {
    const res = await agent.get(`/api/cycle/${"four"}/${"five"}`);

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("error");
    expect(res.body.error).toContain("Invalid");
  });
});

describe("tracks cycle", () => {
  let createdCycleIds = [];

  it("adds new cycle days with valid data", async () => {
    const res = await agent
      .post("/api/track/period")
      .send([
        { date: new Date("2026-08-05").toISOString() },
        { date: new Date("2026-08-06").toISOString() },
        { date: new Date("2026-08-07").toISOString() },
      ]);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("success");
    expect(res.body.success).toBe(true);

    const cycleDays = await prisma.cycleDay.findMany({
      where: { userID: user.id },
      orderBy: { date: "asc" },
    });

    expect(cycleDays.length).toBeGreaterThanOrEqual(3);
    createdCycleIds = cycleDays.map((day) => day.id);
  });

  it("does not add cycle days with future dates", async () => {
    const res = await agent
      .post("/api/track/period")
      .send([{ date: new Date("2027-08-05").toISOString() }]);

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("error");
  });

  it("does not add cycle days with invalid date format", async () => {
    const res = await agent
      .post("/api/track/period")
      .send([{ date: "not-a-valid-date" }]);

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("error");
  });

  it("deletes cycle days with valid data", async () => {
    const cycleToDelete = createdCycleIds[0];

    const res = await agent
      .post("/api/track/period")
      .send([{ id: cycleToDelete }]);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("success");
    expect(res.body.success).toBe(true);

    const deletedCycle = await prisma.cycleDay.findUnique({
      where: { id: cycleToDelete },
    });

    expect(deletedCycle).toBeNull();
  });

  it("handles mixed operations appropriately", async () => {
    const cycleToDelete = createdCycleIds[1];

    const res = await agent
      .post("/api/track/period")
      .send([
        { id: cycleToDelete },
        { date: new Date("2026-08-10").toISOString() },
        { date: new Date("2026-08-11").toISOString() },
      ]);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("success");
    expect(res.body.success).toBe(true);

    const deletedCycle = await prisma.cycleDay.findUnique({
      where: { id: cycleToDelete },
    });
    expect(deletedCycle).toBeNull();

    const allCycleDays = await prisma.cycleDay.findMany({
      where: { userID: user.id },
    });
    expect(allCycleDays.length).toBeGreaterThan(0);
  });

  it("handles empty array successfully", async () => {
    const res = await agent.post("/api/track/period").send([]);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("success");
    expect(res.body.success).toBe(true);
  });
});

describe("validates and normalizes dates", () => {
  it("normalizes dates to midnight", async () => {
    const dateWithTime = new Date("2026-09-01T15:30:00");

    const res = await agent
      .post("/api/track/period")
      .send([{ date: dateWithTime.toISOString() }]);

    expect(res.status).toBe(200);

    const cycleDay = await prisma.cycleDay.findFirst({
      where: {
        userID: user.id,
        date: new Date("2026-09-01T00:00:00"),
      },
    });

    expect(cycleDay).not.toBeNull();
  });
});
