import { test, expect } from "@playwright/test";
import { LoginPage } from "./pages/LoginPage";
import { SignupPage } from "./pages/SignupPage";

test.describe("Authentication Flow", () => {
  let loginPage: LoginPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    await loginPage.goto();
  });

  test("should display login form", async () => {
    await expect(loginPage.heading).toBeVisible();

    await expect(loginPage.emailInput).toBeVisible();
    await expect(loginPage.passwordInput).toBeVisible();

    await expect(loginPage.loginButton).toBeVisible();
  });

  test("should toggle between login and signup forms", async ({ page }) => {
    const signupPage = new SignupPage(page);

    await expect(loginPage.heading).toBeVisible();
    await loginPage.switchToSignup();
    await expect(signupPage.heading).toBeVisible();

    await signupPage.switchToLogin();

    await expect(loginPage.heading).toBeVisible();
  });

  test("should login successfully with valid credentials", async ({ page }) => {
    await loginPage.login("test@example.com", "password123");

    await page.waitForURL("**/pill");

    expect(page.url()).toContain("/pill");
  });

  test("should show error with invalid credentials", async () => {
    await loginPage.login("invalid@example.com", "wrongpassword");

    await expect(loginPage.errorMessage).toBeVisible({ timeout: 5000 });
  });

  test("should logout successfully", async ({ page }) => {
    await loginPage.login("test@example.com", "password123");

    await page.waitForURL("**/pill");

    await page.getByAltText("open nav").click();

    await page.waitForTimeout(500);

    await page.getByText("LOGOUT").click();

    await page.waitForURL("**/login");

    expect(page.url()).toContain("/login");
    await expect(loginPage.heading).toBeVisible();
  });

  test("should disable login button when form is incomplete", async () => {
    await expect(loginPage.loginButton).toBeDisabled();

    await loginPage.emailInput.fill("test@example.com");
    await expect(loginPage.loginButton).toBeDisabled();

    await loginPage.passwordInput.fill("password123");
    await expect(loginPage.loginButton).toBeEnabled();
  });

  test("should navigate to GitHub OAuth when clicking GitHub login", async ({
    context,
  }) => {
    // Promise.all runs both actions simultaneously:
    // 1. Wait for a new browser tab/window to open
    // 2. Click the GitHub login button (which opens that new tab)
    const [newPage] = await Promise.all([
      context.waitForEvent("page"), // Capture the new tab when it opens
      loginPage.clickGithubLogin(), // Click button that triggers the popup
    ]);

    expect(newPage.url()).toContain("http://localhost:5555/auth/github");
  });

  test("should persist login state when navigating between pages", async ({
    page,
  }) => {
    // Login first
    await loginPage.login("test@example.com", "password123");
    await page.waitForURL("**/pill");

    // Navigate to cycle page
    await page.goto("http://localhost:5173/cycle");
    expect(page.url()).toContain("/cycle");

    // Navigate to account page
    await page.goto("http://localhost:5173/account");
    expect(page.url()).toContain("/account");

    // Navigate back to pill page
    await page.goto("http://localhost:5173/pill");
    expect(page.url()).toContain("/pill");

    // Should still be logged in - not redirected to login
    await page.waitForTimeout(500);
    expect(page.url()).not.toContain("/login");
  });

  test("should persist login state in new tab", async ({ context, page }) => {
    // Login in first tab
    await loginPage.login("test@example.com", "password123");
    await page.waitForURL("**/pill");

    // Open a new tab
    const newTab = await context.newPage();
    await newTab.goto("http://localhost:5173/cycle");

    // Should be logged in automatically (cookies are shared across tabs)
    expect(newTab.url()).toContain("/cycle");
    expect(newTab.url()).not.toContain("/login");

    await newTab.close();
  });

  test("should maintain session across page refresh", async ({ page }) => {
    // Login
    await loginPage.login("test@example.com", "password123");
    await page.waitForURL("**/pill");

    // Refresh the page
    await page.reload();

    // Should still be logged in after refresh
    await page.waitForTimeout(500);
    expect(page.url()).toContain("/pill");
    expect(page.url()).not.toContain("/login");
  });

  test("should maintain session for 30 days (simulated)", async ({
    page,
    context,
  }) => {
    // Login
    await loginPage.login("test@example.com", "password123");
    await page.waitForURL("**/pill");

    // Get cookies
    const cookies = await context.cookies();
    const accessTokenCookie = cookies.find((c) => c.name === "accessToken");

    // Verify cookie exists
    expect(accessTokenCookie).toBeDefined();

    // Simulate 29 days passing - update cookie expiration
    if (accessTokenCookie) {
      const twentyNineDaysFromNow = Date.now() + 29 * 24 * 60 * 60 * 1000;
      await context.addCookies([
        {
          ...accessTokenCookie,
          expires: twentyNineDaysFromNow / 1000,
        },
      ]);
    }

    // Simulate coming back after 29 days (close and reopen)
    await page.close();
    const newPage = await context.newPage();
    await newPage.goto("http://localhost:5173/pill");

    // Should still be logged in (within 30-day window)
    expect(newPage.url()).toContain("/pill");
    expect(newPage.url()).not.toContain("/login");
  });

  test("should redirect to login when session expires (31+ days)", async ({
    page,
    context,
  }) => {
    // Login
    await loginPage.login("test@example.com", "password123");
    await page.waitForURL("**/pill");

    // Get cookies and expire them
    const cookies = await context.cookies();
    const accessTokenCookie = cookies.find((c) => c.name === "accessToken");

    if (accessTokenCookie) {
      // Set cookie to expire in the past
      await context.addCookies([
        {
          ...accessTokenCookie,
          expires: Math.floor(Date.now() / 1000) - 1, // Expired 1 second ago
        },
      ]);
    }

    // Navigate to a protected page
    await page.goto("http://localhost:5173/pill");

    // Should redirect to login (session expired)
    await page.waitForURL("**/login", { timeout: 5000 });
    expect(page.url()).toContain("/login");
  });
});
