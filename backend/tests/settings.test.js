import app from "../server.js";
import supertest from "supertest";
const request = supertest(app);
const agent = supertest.agent(app);
import prisma from "../prisma/client.js";
import { passwordGenie } from "../utils/passwordUtil.js";

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
  it("gets user settings", async () => {
    const res = await agent.get("/api/settings");
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("settings");
  });

  it("does not user settings when not logged in", async () => {
    const res = await request.get("/api/settings");
    expect(res.status).not.toBe(200);
    expect(res.body).toHaveProperty("authenticated");
    expect(res.body.authenticated).toBe(false);
  });
});

describe("updates settings", () => {
  it("updates settings when username is not already in use", async () => {
    const res = await agent.get("/api/updateSettings").send({
      name: "lalala",
      username: "applejacks",
    });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("success");
    expect(res.body.success).toBe(true);
  });

  it("does not update settings when username already in use", async () => {
    // create new user \\
    await createTestUser("apple", "apple@gmail.com", "appleappleapple");

    const res = await agent.get("/api/updateSettings").send({
      name: "lalala",
      username: "apple",
    });
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("error");
    expect(res.body.error).toBe("Username already taken");
  });

  it("updates settings when email is not already in use", async () => {
    const res = await agent.get("/api/updateSettings").send({
      name: "lalala",
      email: "applejacks@applejacks.com",
    });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("success");
    expect(res.body.success).toBe(true);
  });

  it("does not update settings when email already in use", async () => {
    const res = await agent.get("/api/updateSettings").send({
      name: "lalala",
      email: "apple@gmail.com",
    });
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("error");
    expect(res.body.error).toBe("Email already taken");
  });
});

describe("cycle info", () => {
  it("gets cycle info for first time user with no info", async () => {
    const res = await agent.get("/api/getCycleInfo");

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("noInfo");
    expect(res.body.error).toBe("Nothing is entered");
  });

  it("updates cycle info", async () => {
    const res = await agent.get("/api/updateCycleInfo").send({
      cyclelength: "5",
      daysbetweenperiod: "30",
    });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("updatedSettings");
  });

  it("does not update cycle info with non numbers", async () => {
    const res = await agent.get("/api/updateCycleInfo").send({
      cyclelength: "none",
      daysbetweenperiod: "none again",
    });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("message");
  });

  it("gets cycle info for user with info", async () => {
    const res = await agent.get("/api/getCycleInfo");

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("cycleInfo");
  });
});

describe("updates password", () => {
  it("updates password when password passes validation and old password is the same", async () => {
    const res = await agent.patch("/api/updatePassword").send({
      password: "12345678",
      confirmPassword: "12345678",
      oldPassword: "777IMINHEAVEN",
    });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("success");
  });

  it("does not update password when password passed validator but old password is not the same", async () => {
    const res = await agent.patch("/api/updatePassword").send({
      password: "12345678",
      confirmPassword: "12345678",
      oldPassword: "111",
    });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("error");
    expect(res.body.error).toBe("Current password is incorrect");
  });

  it("does not update password when password is passed to validator but old password is the same", async () => {
    const res = await agent.patch("/api/updatePassword").send({
      password: "12345", // too short \\
      confirmPassword: "12345678", // doesnt match \\
      oldPassword: "777IMINHEAVEN",
    });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("errors");
  });
});

describe("deletes account", () => {
  it("deletes the logged in users account", async () => {
    const res = await agent.delete("/api/delete/account");

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("success");
  });
});
