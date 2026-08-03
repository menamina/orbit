import app from "../../server";
import supertest from "supertest";
const request = supertest(app);
const agent = supertest.agent(app);
import prisma from "../../prisma/client";
import { passwordGenie } from "../../utils/password";
// supertest is for api / https endpoint calls without starting a real server \\
// agent is for peristing cookies + sessions across multiple tests \\

jest.setTimeout(5500);
// so tests that take a while dont fail \\

// helper functions \\
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
    },
  });
}

beforeAll(async () => {
  await prisma.user.deleteMany({});
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe(" checking access token ", () => {});

describe(" checking refresh token ", () => {});

describe(" checking username for usage during signup ", () => {});

describe(" checking email for usage during signup ", () => {});

describe(" signing ", () => {});

describe(" logging in locally ", () => {});

describe(" logging in with oauth - github ", () => {});

describe(" logging out ", () => {});

describe(" logging out everywhere ", () => {});
