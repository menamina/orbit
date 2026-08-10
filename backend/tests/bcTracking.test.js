import app from "../../server";
import supertest from "supertest";
const request = supertest(app);
const agent = supertest.agent(app);
import prisma from "../../prisma/client";
import { passwordGenie } from "../../utils/password";

jest.setTimeout(5500);

let user;
let pill;

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
  it("gets the month + year of the birth control pack", async () => {
    const res = await agent.get(`/api/pill/8/2026`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it("posts birth control pill", async () => {
    const res = await agent.post(`/api/track/pill`).send({
      date: "2026-08-07",
    });

    pill = res.body.id;

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("id");
    expect(res.body).toHaveProperty("date");
  });

  it("does not post birth control pill if the date is greater than today's date", async () => {
    const res = await agent.post(`/api/track/pill`).send({
      date: "2027-08-07",
    });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("error");
  });

  it("prevents duplicate pill tracking on the same date", async () => {
    const date = "2026-08-09";
    const res1 = await agent.post(`/api/track/pill`).send({ date });
    expect(res1.status).toBe(200);

    const res2 = await agent.post(`/api/track/pill`).send({ date });
    expect(res2.status).toBe(400);
    expect(res2.body).toHaveProperty("error");
    expect(res2.body.error).toContain("already tracked");

    await agent.delete(`/api/pill/${res1.body.id}`);
  });

  it("rejects invalid date format", async () => {
    const res = await agent.post(`/api/track/pill`).send({
      date: "not-a-date",
    });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("error");
  });

  it("rejects pill tracking without date", async () => {
    const res = await agent.post(`/api/track/pill`).send({});

    expect(res.status).toBe(400);
    expect(res.body.error).toContain("Date is required");
  });

  it("returns empty array for month with no pills", async () => {
    const res = await agent.get(`/api/pill/12/2025`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(0);
  });

  it("returns error when deleting non-existent pill", async () => {
    const res = await agent.delete(`/api/pill/999999`);

    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty("error");
  });

  it("prevents deleting another user's pill", async () => {
    const otherUser = await createTestUser(
      "other",
      "other@test.com",
      "password123",
    );

    const otherPill = await prisma.pillTracking.create({
      data: {
        userID: otherUser.id,
        date: new Date("2026-08-08"),
      },
    });

    const res = await agent.delete(`/api/pill/${otherPill.id}`);

    expect(res.status).toBe(400);
    expect(res.body.error).toContain("Not authorized");

    await dlt(otherUser.id);
  });

  it("deletes birth control pill", async () => {
    const res = await agent.delete(`/api/pill/${pill}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("success");
  });
});
