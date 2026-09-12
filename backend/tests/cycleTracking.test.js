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
  it("gets users cycle by month and year with valid data", async () => {});
  it("does not get users cycle by month and year with invalid data", async () => {});
});

describe("tracks cycle", () => {
  it(" adds a new cycle with valid data", async () => {});
  it(" does not add a new cycle with valid data", async () => {});
  it(" deletes a cycle with valid data", async () => {});
  it(" does not delete a cycle with valid data", async () => {});
  it("with multiple items in an array it updates the cycle appropriately with valid data", async () => {});
});

describe("validates and normalizes dates", () => {
  it("", async () => {});
});
