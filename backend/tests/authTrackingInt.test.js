import app from "../../server";
import supertest from "supertest";
const request = supertest(app);
const agent = supertest.agent(app);
import prisma from "../../prisma/client";
import { passwordGenie } from "../../utils/password";
import generateAccessToken from "../auth/jwt";

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
          saledHash: hashedPassword,
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
  await agent.post("/log-out");
}

async function dlt(userID) {
  await prisma.user.delete({ where: { id: userID } });
}

async function dltAll() {
  await prisma.user.deleteMany({});
}

beforeAll(async () => {
  dltAll();
  user = await createTestUser();
});

afterAll(async () => {
  if (user) {
    dlt(user.id);
  }
  await prisma.$disconnect();
});

// tests \\

describe(" checking username for usage during signup ", () => {
  it("returns a status of 400 when wanted username is in use", async () => {
    const res = superagent.get("/api/signup/isUsernameInUse").send({
      username: "orbiter",
    });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Username in use");
  });

  it("returns a status of 200 when wanted username is NOT in use", async () => {
    dlt(user.id);
    const res = superagent.get("/api/signup/isUsernameInUse").send({
      username: "orbiter",
    });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});

describe(" checking email for usage during signup ", () => {
  it("returns a status of 400 when wanted email is in use", async () => {
    const res = superagent.get("/api/signup/isUsernameInUse").send({
      email: "test@gmail.com",
    });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Email in use");
  });

  it("returns a status of 200 when wanted email is NOT in use", async () => {
    dlt(user.id);
    const res = superagent.get("/api/signup/isEmailInUse").send({
      username: "orbiter",
    });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});

describe(" signing up locally ", () => {
  it("signs a user up with complete data verified by middleware", () => {
    const res = superagent.post("/api/signup/").send({
      name: "xy",
      username: "xyz",
      email: "xyz@gmail.com",
      password: "zzzzzzzz",
      confirmPassword: "zzzzzzzz",
    });

    expect(res.status.body).notToEqual({ errors });
    expect(res.status.success).toBe(true);
  });

  it("does not sign a user up with invalid data verified by middleware", () => {
    const res = superagent.post("/api/signup/").send({
      name: "x", // name is too short
      username: "x", // username is too short
      email: "xyz-gmail.com", // wrong email
      password: "zzz", // password too short
      confirmPassword: "zzzzzzzz", // passwords dont match
    });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty(" errors ");
    expect(res.body.errors).toHaveLength(5);
  });

  it("does not sign a user up with partially valid data verified by middleware", () => {
    const res = await superagent.post("/api/signup/").send({
      name: "", // missing name
      username: "x", // username is too short
      email: "xyz@gmail.com",
      password: "zzzzzzzz",
      confirmPassword: "zzzzzzzz",
    });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty(" errors ");
    expect(res.body.errors).toHaveLength(2);
  });
});

describe(" logging in // token checking ", () => {
  it("logs a user in with correct credentials", () => {
    const loggingIn = await login();
    expect(loggingIn.status).toBe(200);
    expect(loggingIn.body).toHaveProperty("accessToken");
    expect(loggingIn.body).toHaveProperty("userINFO");
  });

  it("does not log a user in with incorrect email", () => {
    const res = await supertest.post("/api/login", {
        email: "uWu",
        password: "uWugorl"
    })

    expect(res.status).toBe(400)
    expect(res.body).toHaveProperty("invalidEmail")
    expect(res.body.invalidEmail).toBe("Email is invalid")

  });

    it("does not log a user in with incorrect password", () => {
    const res = await supertest.post("/api/login", {
        email: "test@gmail.com",
        password: "uWugorl"
    })

    expect(res.status).toBe(400)
    expect(res.body).toHaveProperty("invalidPassword")
    expect(res.body.invalidPassword).toBe("Invalid password")

  });

  it("verifies a valid access token", () => {
    const loggingIn = await login();
    const loginRes = await loggingIn;
    const accessToken = loginRes.accessToken;

    const res = await agent.get("/").set("Authorization", `Bearer ${accessToken}`)
    expect(res.status).toBe(200)
    expect(res.body.authenticated).toBe(true)

    logout()

  });

  it("does not verify an invalid access token", () => {
    const loggingIn = await login();
    const loginRes = await loggingIn;

    const res = await agent.get("/").set("Authorization", `Bearer fakeToken`)
    expect(res.status).toBe(403)
    expect(res.status).notToBe(200)
    expect(res.body).toHaveProperty("accessTokenExpired")

    logout()
  });

  it("does not verify a missing access token", () => {
    const loggingIn = await login();
    const loginRes = await loggingIn;

    const res = await agent.get("/").set("Authorization", `Bearer`)
    expect(res.status).toBe(401)
    expect(res.status).notToBe(200)
    expect(res.body).toHaveProperty("authenticated")

    logout()
  });

  it("verifies valid refresh token", () => {
    const loggingIn = login();
  });

 it("does not verify invalid refresh token", () => {
    const loggingIn = login();
  });

 it("does not verify missing refresh token", () => {
    const loggingIn = login();
  });
});

describe(" logging out ", () => {
  it("logs out a user on a single device", () => {});

  it("logs out a user on multiple devices", () => {});
});
