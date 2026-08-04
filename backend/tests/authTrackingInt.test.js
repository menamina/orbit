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
  await agent.post("/login-API").send({
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
  it("signs a user up with fully passing validator middleware", () => {
    const res = superagent.post("/api/signup/").send({
      name: "x",
      username: "xyz",
      email: "xyz@gmail.com",
      password: "zzzzzzzz",
      confirmPassword: "zzzzzzzz",
    });

    expect(res.status.body).notToEqual({ errors });
    expect(res.status.success).toBe(true);
  });

  // do it so it doesnt sign up a user
});

describe(" logging in // token checking ", () => {});

describe(" checking access token ", () => {
  const generateToken = generateAccessToken();
});

describe(" checking refresh token ", () => {
  logout();
});

describe(" logging out ", () => {});

describe(" logging out everywhere ", () => {});
