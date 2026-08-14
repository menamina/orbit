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

describe("getting settings", () => {
  it("gets user settings", () => {
    const res = agent.get("/api/settings");
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("settings");
  });

  it("does not user settings when not logged in", () => {
    const res = request.get("/api/settings");
    expect(res.status).not.toBe(200);
    expect(res.body).toHaveProperty("authenticated");
    expect(res.body.authenticated).toBe(false);
  });
});

describe("updates settings", () => {
  it("updates settings when username is not already in use", () => {
    const res = agent.get("/api/updateSettings").send({
      name: "lalala",
      username: "applejacks",
    });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("success");
    expect(res.body.success).toBe(true);
  });

  it("does not update settings when username already in use", () => {
    // create new user \\
    createTestUser("apple", "apple@gmail.com", "appleappleapple");

    const res = agent.get("/api/updateSettings").send({
      name: "lalala",
      username: "apple",
    });
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("error");
    expect(res.body.error).toBe("Username already taken");
  });

  it("updates settings when email is not already in use", () => {
    const res = agent.get("/api/updateSettings").send({
      name: "lalala",
      email: "applejacks@applejacks.com",
    });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("success");
    expect(res.body.success).toBe(true);
  });

  it("does not update settings when email already in use", () => {
    const res = agent.get("/api/updateSettings").send({
      name: "lalala",
      email: "apple@gmail.com",
    });
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("error");
    expect(res.body.error).toBe("Email already taken");
  });
});

describe("cycle info", () => {
  it("gets cycle info for first time user with no info", () => {
    const res = agent.get("/api/updateSettings").send({
      name: "lalala",
      email: "apple@gmail.com",
    });
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("error");
    expect(res.body.error).toBe("Email already taken");
  });

  it("gets cycle info for user with info", () => {
    const res = agent.get("/api/updateSettings").send({
      name: "lalala",
      email: "apple@gmail.com",
    });
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("error");
    expect(res.body.error).toBe("Email already taken");
  });

  it("updates cycle info", () => {
    const res = agent.get("/api/updateSettings").send({
      name: "lalala",
      email: "apple@gmail.com",
    });
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("error");
    expect(res.body.error).toBe("Email already taken");
  });
});

describe("updates password", () => {});

describe("deletes account", () => {});
