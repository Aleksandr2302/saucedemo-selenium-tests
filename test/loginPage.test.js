import { By, until, Builder, Key } from "selenium-webdriver";
import { expect } from "chai";

describe("saucedemo Login Page", function () {
  this.timeout(20000);
  let driver;
  let usernameField, passwordField, loginButton;

  before(async () => {
    driver = await new Builder().forBrowser("chrome").build();
    await driver.get("https://www.saucedemo.com/");
  });

  beforeEach(async () => {
    // ждём пока поля появятся и находим заново (чтобы не было stale)
    usernameField = await driver.wait(
      until.elementLocated(By.id("user-name")),
      5000,
    );
    passwordField = await driver.wait(
      until.elementLocated(By.id("password")),
      5000,
    );
    loginButton = await driver.wait(
      until.elementLocated(By.id("login-button")),
      5000,
    );
  });

  after(async () => {
    await driver.quit();
  });

  async function clearByKeys(el) {
    await el.sendKeys(Key.chord(Key.CONTROL, "a"), Key.DELETE);
  }

  // Test #1
  it("Test#1 - title verification on the Login Page", async () => {
    const title = await driver.getTitle();
    expect(title).to.equal("Swag Labs"); // проверяем, что тайтл = Swag Labs
  });

  // Test #2
  it("Test#2 - verification of visible loin and password field on the Login Page", async () => {
    expect(usernameField).to.exist;
    expect(passwordField).to.exist;
  });

  // Test #3
  it("Test#3 - verification of initial condition for loin and password fields on the Login Page", async () => {
    const usernameValue = await usernameField.getAttribute("value");
    const passwordValue = await passwordField.getAttribute("value");

    expect(usernameValue).to.equal("");
    expect(passwordValue).to.equal("");
  });

  // Test #4
  it("Test#4 - verification of login button on the Login Page", async () => {
    expect(loginButton).to.exist;
  });

  // Test #5
  it("Test#5 - login with invalid credentials on the Login Page", async () => {
    // вводим неправильные данные
    await usernameField.sendKeys("wrong_user");
    await passwordField.sendKeys("wrong_pass");

    // кликаем Login
    await loginButton.click();

    const errorElement = await driver.findElement(
      By.css('h3[data-test="error"]'),
    );
    const errorText = await errorElement.getText();

    expect(errorText).to.include(
      "Epic sadface: Username and password do not match any user in this service",
    );

    await clearByKeys(usernameField);
    await clearByKeys(passwordField);
  });

  // Test #6
  it("Test#6 - login with valid credentials", async () => {
    // вводим правильные данные
    await usernameField.sendKeys("standard_user");
    await passwordField.sendKeys("secret_sauce");

    // кликаем Login
    await loginButton.click();

    // ждём пока появится заголовок "Products"
    const productsTitle = await driver.wait(
      until.elementLocated(By.css('span[data-test="title"]')),
      10000,
    );

    // теперь получаем текст
    const text = await productsTitle.getText();

    expect(text).to.include("Products");
  });
});
