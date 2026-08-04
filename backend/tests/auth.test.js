import app from "../../server";
import supertest from "supertest";
const request = supertest(app);
const agent = supertest.agent(app);
import prisma from "../../prisma/client";
import { passwordGenie } from "../../utils/password";
import { generateAccessToken } from "../auth/jwt";

// supertest is for api / https endpoint calls without starting a real server \\
// agent is for peristing cookies + sessions across multiple tests \\

jest.setTimeout(5500);
// so tests that take a while dont fail \\

// helper functions \\
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
});

afterEach(async () => {
  // Clean up any active sessions after each test
  try {
    await agent.post("/api/logout");
  } catch (e) {
    // Ignore if already logged out
  }
});

afterAll(async () => {
  if (user) {
    await dlt(user.id);
  }
  await prisma.$disconnect();
});

// tests \\

describe(" checking username for usage during signup ", () => {
  it("returns a status of 400 when wanted username is in use", async () => {
    const res = await request.get("/api/signup/username?username=orbiter");

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Username in use");
  });

  it("returns a status of 200 when wanted username is NOT in use", async () => {
    await dlt(user.id);
    const res = await request.get("/api/signup/username?username=orbit");

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});

describe(" checking email for usage during signup ", () => {
  it("returns a status of 400 when wanted email is in use", async () => {
    const res = await request.get("/api/signup/email?email=test@gmail.com");

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Email in use");
  });

  it("returns a status of 200 when wanted email is NOT in use", async () => {
    await dlt(user.id);
    const res = await request.get("/api/signup/email?email=test@gmail.com");

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});

describe(" signing up locally ", () => {
  it("signs a user up with complete data verified by middleware", async () => {
    const res = await request.post("/api/signup").send({
      name: "xy",
      username: "xyz",
      email: "xyz@gmail.com",
      password: "zzzzzzzz",
      confirmPassword: "zzzzzzzz",
    });

    expect(res.status).toBe(200);
    expect(res.body).not.toHaveProperty("errors");
    expect(res.body.success).toBe(true);
  });

  it("does not sign a user up with invalid data verified by middleware", async () => {
    const res = await request.post("/api/signup").send({
      name: "x", // name is too short
      username: "x", // username is too short
      email: "xyz-gmail.com", // wrong email
      password: "zzz", // password too short
      confirmPassword: "zzzzzzzz", // passwords dont match
    });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("errors");
    expect(Object.keys(res.body.errors).length).toBeGreaterThan(0);
  });

  it("does not sign a user up with partially valid data verified by middleware", async () => {
    const res = await request.post("/api/signup").send({
      name: "", // missing name
      username: "x", // username is too short
      email: "xyz@gmail.com",
      password: "zzzzzzzz",
      confirmPassword: "zzzzzzzz",
    });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("errors");
    expect(Object.keys(res.body.errors).length).toBeGreaterThan(0);
  });
});

describe(" logging in // token checking ", () => {
  it("logs a user in with correct credentials", async () => {
    const loggingIn = await login();
    expect(loggingIn.status).toBe(200);
    expect(loggingIn.body).toHaveProperty("accessToken");
    expect(loggingIn.body).toHaveProperty("userINFO");
  });

  it("does not log a user in with incorrect email", async () => {
    const res = await request.post("/api/login").send({
      email: "uWu",
      password: "uWugorl",
    });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("invalidEmail");
    expect(res.body.invalidEmail).toBe("Email is invalid");
  });

  it("does not log a user in with incorrect password", async () => {
    const res = await request.post("/api/login").send({
      email: "test@gmail.com",
      password: "uWugorl",
    });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("invalidPassword");
    expect(res.body.invalidPassword).toBe("Invalid password");
  });

  it("verifies a valid access token", async () => {
    const loggingIn = await login();
    const accessToken = loggingIn.body.accessToken;

    const res = await agent
      .get("/")
      .set("Authorization", `Bearer ${accessToken}`);
    expect(res.status).toBe(200);
    expect(res.body.authenticated).toBe(true);
  });

  it("does not verify an invalid access token", async () => {
    await login();

    const res = await agent.get("/").set("Authorization", `Bearer fakeToken`);
    expect(res.status).toBe(403);
    expect(res.body).toHaveProperty("accessTokenExpired");
  });

  it("does not verify a missing access token", async () => {
    const res = await request.get("/");
    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty("noAccessToken");
  });

  it("verifies valid refresh token", async () => {
    await login();
    const res = await agent.post("/api/checkRefreshToken");
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("newAccessToken");
  });

  it("does not verify invalid refresh token", async () => {
    const res = await request
      .post("/api/checkRefreshToken")
      .set("Cookie", "refreshToken=fakeInvalidToken123");

    expect(res.status).toBe(403);
    expect(res.body).toHaveProperty("error");
    expect(res.body.error).toBe("Invalid refresh token");
  });

  it("does not verify missing refresh token", async () => {
    const res = await request.post("/api/checkRefreshToken");

    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty("error");
    expect(res.body.error).toBe("No refresh token");
  });
});

describe(" logging out ", () => {
  it("logs out a user on a single device", async () => {
    await login();
    const res = await agent.post("/api/logout");
    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Logged out successfully");
  });

  it("logs out a user on multiple devices", async () => {
    await login();
    const res = await agent.post("/api/logoutEverywhere");
    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Logged out from all devices");
  });
});
