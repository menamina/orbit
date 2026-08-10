import app from "../../server";
import supertest from "supertest";
const request = supertest(app);
const agent = supertest.agent(app);
import prisma from "../../prisma/client";

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
  login();
});

afterAll(async () => {
  if (user) {
    await dlt(user.id);
  }
  await prisma.$disconnect();
});

describe("birth control api", () => {
  it("gets the month + year of the birth control pack", async () => {
    const res = await agent.get(`/api/pill/${user.id}/"8"/"2026"`);

    expect(res.status).toBe(200);
    expect(res.status).toHaveProperty(monthOfPills);
  });

  it("posts birth control pill", async () => {});

  it("deletes birth control pill", async () => {});
});
