import { By, until, Builder, Key } from "selenium-webdriver";
import { expect } from "chai";

import * as chrome from "selenium-webdriver/chrome.js";

let options = new chrome.Options();
options.addArguments("--disable-infobars"); // Optional: Disables info bars, which might include password-related messages
options.setUserPreferences({
  credentials_enable_service: false,
  "profile.password_manager_enabled": false,
  "profile.password_manager_leak_detection": false, // Disables password leak detection warnings
});

describe("saucedemo Login Page", function () {
  this.timeout(20000);
  let driver;
  before(async () => {
    driver = await new Builder()
      .forBrowser("chrome")
      .setChromeOptions(options)
      .build();
    await driver.get("https://www.saucedemo.com/");
  });

  beforeEach(async () => {});

  after(async () => {
    await driver.quit();
  });

  // Test 16
  it("Test#16 -Prerequisites:  login with valid credentials, add random product, navigate to checkout page", async () => {
    // ждём пока поля появятся и находим заново (чтобы не было stale)
    const usernameField = await driver.wait(
      until.elementLocated(By.id("user-name")),
      5000,
    );
    const passwordField = await driver.wait(
      until.elementLocated(By.id("password")),
      5000,
    );
    const loginButton = await driver.wait(
      until.elementLocated(By.id("login-button")),
      5000,
    );

    // вводим правильные данные

    await usernameField.sendKeys("standard_user");
    await passwordField.sendKeys("secret_sauce");

    // проверим, что реально лежит в полях
    const userValue = await usernameField.getAttribute("value");
    const passValue = await passwordField.getAttribute("value");

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

    // выбираем случайный продукт
    const products = await driver.findElements(
      By.css('div.inventory_item[data-test="inventory-item"]'),
    );
    const randomIndex = Math.floor(Math.random() * products.length);
    const product = products[randomIndex];

    // находим кнопку внутри всего продукта
    const btnEl = await product.findElement(By.css("button.btn_inventory"));

    // кликаем
    await btnEl.click();

    // ждём, пока кнопка станет "Remove" (с корректным элементом)
    await driver.wait(
      async () => {
        const text = await product
          .findElement(By.css("button.btn_inventory"))
          .getText();
        return text === "Remove";
      },
      5000,
      "Button text did not change to Remove",
    );

    // проверяем текст
    const btnTextAfterClick = await product
      .findElement(By.css("button.btn_inventory"))
      .getText();
    expect(btnTextAfterClick).to.equal("Remove");

    // проверяем количество товаров в корзине
    const bucket = await driver.findElement(By.css("a.shopping_cart_link"));
    const bucketCountText = await bucket.getText();

    const bucketCount = parseInt(bucketCountText, 10);
    expect(bucketCount).to.equal(1);

    const basketBtn = await driver.findElement(By.css("a.shopping_cart_link"));
    await basketBtn.click();

    const checkoutBtn = await driver.findElement(
      By.css("button.btn.btn_action.btn_medium.checkout_button"),
    );
    const checkoutBtnText = await checkoutBtn.getText();
    expect(checkoutBtnText).to.equal("Checkout");

    await checkoutBtn.click();
  });

  // Test #17
  it("Test#17 - verification of Placeholder on the Checkout Page", async () => {
    const firstNameField = await driver.findElement(By.id("first-name"));
    const firstNameFieldPlaceholder =
      await firstNameField.getAttribute("placeholder");
    expect(firstNameFieldPlaceholder).to.equal("First Name");

    const lastNameField = await driver.findElement(By.id("last-name"));
    const lastNameFieldPlaceholder =
      await lastNameField.getAttribute("placeholder");
    expect(lastNameFieldPlaceholder).to.equal("Last Name");

    const zipCodeNameField = await driver.findElement(By.id("postal-code"));
    const zipCodeNameFieldPlaceholder =
      await zipCodeNameField.getAttribute("placeholder");
    expect(zipCodeNameFieldPlaceholder).to.equal("Zip/Postal Code");
  });

  // Test #18
  it("Test#18 - Verification login without filling the first name on the Checkout Page", async () => {
    const firstNameField = await driver.findElement(By.id("first-name"));

    const firstNameFieldPlaceholder =
      await firstNameField.getAttribute("value");
    expect(firstNameFieldPlaceholder).to.equal("");

    const lastNameField = await driver.findElement(By.id("last-name"));
    await lastNameField.sendKeys("Lala");
    const lastNameFieldPlaceholder = await lastNameField.getAttribute("value");
    expect(lastNameFieldPlaceholder).to.equal("Lala");

    const zipCodeNameField = await driver.findElement(By.id("postal-code"));
    await zipCodeNameField.sendKeys("15216");
    const zipCodeNameFieldPlaceholder =
      await zipCodeNameField.getAttribute("value");
    expect(zipCodeNameFieldPlaceholder).to.equal("15216");

    // нажимаем кнопку Continue, чтобы вызвать ошибку
    const continueButton = await driver.findElement(By.id("continue"));
    await continueButton.click();

    // ждём появления элемента ошибки
    const errorEl = await driver.wait(
      until.elementLocated(By.css('[data-test="error"]')),
      5000, // максимум 5 секунд
      "Error message not found",
    );
    const errorText = await errorEl.getText();
    expect(errorText).to.equal("Error: First Name is required");

    // Повторно находим элементы (DOM перерендерился)
    const firstNameFieldAgain = await driver.findElement(By.id("first-name"));
    const lastNameFieldAgain = await driver.findElement(By.id("last-name"));
    const zipCodeFieldAgain = await driver.findElement(By.id("postal-code"));

    // Используем sendKeys для очистки (работает в React)
    for (const field of [
      firstNameFieldAgain,
      lastNameFieldAgain,
      zipCodeFieldAgain,
    ]) {
      await field.sendKeys(Key.CONTROL, "a", Key.BACK_SPACE);
    }
  });

  // Test #19
  it("Test#19 - Verification login without filling the last name on the Checkout Page", async () => {
    const firstNameField = await driver.findElement(By.id("first-name"));
    await firstNameField.sendKeys("Alex");
    const firstNameFieldPlaceholder =
      await firstNameField.getAttribute("value");
    expect(firstNameFieldPlaceholder).to.equal("Alex");

    const lastNameField = await driver.findElement(By.id("last-name"));

    const lastNameFieldPlaceholder = await lastNameField.getAttribute("value");
    expect(lastNameFieldPlaceholder).to.equal("");

    const zipCodeNameField = await driver.findElement(By.id("postal-code"));
    await zipCodeNameField.sendKeys("15216");
    const zipCodeNameFieldPlaceholder =
      await zipCodeNameField.getAttribute("value");
    expect(zipCodeNameFieldPlaceholder).to.equal("15216");

    // нажимаем кнопку Continue, чтобы вызвать ошибку
    const continueButton = await driver.findElement(By.id("continue"));
    await continueButton.click();

    const errorEl = await driver.findElement(By.css('[data-test="error"]'));
    const errorText = await errorEl.getText();
    expect(errorText).to.equal("Error: Last Name is required");

    // Повторно находим элементы (DOM перерендерился)
    const firstNameFieldAgain = await driver.findElement(By.id("first-name"));
    const lastNameFieldAgain = await driver.findElement(By.id("last-name"));
    const zipCodeFieldAgain = await driver.findElement(By.id("postal-code"));

    // Используем sendKeys для очистки (работает в React)
    for (const field of [
      firstNameFieldAgain,
      lastNameFieldAgain,
      zipCodeFieldAgain,
    ]) {
      await field.sendKeys(Key.CONTROL, "a", Key.BACK_SPACE);
    }
  });

  // Test #20
  it("Test#20 - Verification login without filling the zip code on the Checkout Page", async () => {
    const firstNameField = await driver.findElement(By.id("first-name"));
    await firstNameField.sendKeys("Alex");
    const firstNameFieldPlaceholder =
      await firstNameField.getAttribute("value");
    expect(firstNameFieldPlaceholder).to.equal("Alex");

    const lastNameField = await driver.findElement(By.id("last-name"));
    await lastNameField.sendKeys("Lala");
    const lastNameFieldPlaceholder = await lastNameField.getAttribute("value");
    expect(lastNameFieldPlaceholder).to.equal("Lala");

    const zipCodeNameField = await driver.findElement(By.id("postal-code"));

    const zipCodeNameFieldPlaceholder =
      await zipCodeNameField.getAttribute("value");
    expect(zipCodeNameFieldPlaceholder).to.equal("");

    // нажимаем кнопку Continue, чтобы вызвать ошибку
    const continueButton = await driver.findElement(By.id("continue"));
    await continueButton.click();

    const errorEl = await driver.findElement(By.css('[data-test="error"]'));
    const errorText = await errorEl.getText();
    expect(errorText).to.equal("Error: Postal Code is required");

    // Повторно находим элементы (DOM перерендерился)
    const firstNameFieldAgain = await driver.findElement(By.id("first-name"));
    const lastNameFieldAgain = await driver.findElement(By.id("last-name"));
    const zipCodeFieldAgain = await driver.findElement(By.id("postal-code"));

    // Используем sendKeys для очистки (работает в React)
    for (const field of [
      firstNameFieldAgain,
      lastNameFieldAgain,
      zipCodeFieldAgain,
    ]) {
      await field.sendKeys(Key.CONTROL, "a", Key.BACK_SPACE);
    }
  });

  // Test #21
  it("Test#21 - verification login with filling all fields correct", async () => {
    const firstNameField = await driver.findElement(By.id("first-name"));
    await firstNameField.sendKeys("Alex");
    const firstNameFieldPlaceholder =
      await firstNameField.getAttribute("value");
    expect(firstNameFieldPlaceholder).to.equal("Alex");

    const lastNameField = await driver.findElement(By.id("last-name"));
    await lastNameField.sendKeys("Lala");
    const lastNameFieldPlaceholder = await lastNameField.getAttribute("value");
    expect(lastNameFieldPlaceholder).to.equal("Lala");

    const zipCodeNameField = await driver.findElement(By.id("postal-code"));
    await zipCodeNameField.sendKeys("15216");
    const zipCodeNameFieldPlaceholder =
      await zipCodeNameField.getAttribute("value");
    expect(zipCodeNameFieldPlaceholder).to.equal("15216");
  });

  // Test #22
  it("Test#22 - verification continue button on the Checkout Page", async () => {
    const continueBtn = await driver.findElement(By.id("continue"));
    await continueBtn.click();

    const finishBtn = await driver.findElement(
      By.css("button.btn.btn_action.btn_medium.cart_button"),
    );
    expect(await finishBtn.isDisplayed()).to.be.true;
  });

  // Test #23
  it("Test#23 - verification Overview on the Checkout Page", async () => {
    // QTY text
    const cartQL = await driver.findElement(
      By.css('[data-test="cart-quantity-label"]'),
    );
    const textQL = await cartQL.getText();
    expect(textQL).to.equal("QTY");

    // Description title text
    const descTitle = await driver.findElement(
      By.css('[data-test="cart-desc-label"]'),
    );
    const textDescTitle = await descTitle.getText();
    expect(textDescTitle).to.equal("Description");

    // Description text
    const productDesc = await driver.findElement(
      By.css('[data-test="inventory-item-desc"]'),
    );
    const productDescText = await productDesc.getText();
    expect(productDescText).to.not.equal("");

    // Price text
    const productPrice = await driver.findElement(
      By.css('[data-test="inventory-item-price"]'),
    );
    const productPriceText = await productPrice.getText();
    // проверка, что текст не пустой и начинается с $
    expect(productPriceText).to.match(/^\$\d+(\.\d{2})?$/);

    // Payment information label text
    const paymentInfoTitle = await driver.findElement(
      By.css('[data-test="payment-info-label"]'),
    );
    const paymentInfoTitleText = await paymentInfoTitle.getText();
    expect(paymentInfoTitleText).to.equal("Payment Information:");

    // Payment information text
    const paymentInfo = await driver.findElement(
      By.css('[data-test="payment-info-value"]'),
    );
    const paymentInfoText = await paymentInfo.getText();
    expect(paymentInfoText).to.not.equal("");

    // Shipping information label text
    const shippingInfoTitle = await driver.findElement(
      By.css('[data-test="shipping-info-label"]'),
    );
    const shippingInfoTitleText = await shippingInfoTitle.getText();
    expect(shippingInfoTitleText).to.equal("Shipping Information:");

    // Shipping information text
    const shippingInfo = await driver.findElement(
      By.css('[data-test="shipping-info-value"]'),
    );
    const shippingInfoText = await shippingInfo.getText();
    expect(shippingInfoText).to.not.equal("");

    // Price information label text
    const priceInfoTitle = await driver.findElement(
      By.css('[data-test="total-info-label"]'),
    );
    const totalInfoTitleText = await priceInfoTitle.getText();
    expect(totalInfoTitleText).to.equal("Price Total");

    // Item total text
    const itemTotalInfo = await driver.findElement(
      By.css('[data-test="subtotal-label"]'),
    );
    const itemTotalText = await itemTotalInfo.getText();
    expect(itemTotalText).to.match(/^.+:\s\$\d+(\.\d{2})?$/);

    // Tax text
    const taxInfo = await driver.findElement(By.css('[data-test="tax-label"]'));
    const taxText = await taxInfo.getText();
    expect(taxText).to.match(/^.+:\s\$\d+(\.\d{2})?$/);

    // Total tax text
    const totalTaxInfo = await driver.findElement(
      By.css('[data-test="total-label"]'),
    );
    const totalTaxText = await totalTaxInfo.getText();
    expect(totalTaxText).to.match(/^.+:\s\$\d+(\.\d{2})?$/);
  });

  // Test #24
  it("Test#24 - verification of complete Page", async () => {
    const finishBtn = await driver.findElement(By.css('[data-test="finish"]'));
    await finishBtn.click();

    // Thanks text
    const thankYouEl = await driver.findElement(
      By.css('[data-test="complete-header"]'),
    );
    const thankYouText = await thankYouEl.getText();
    expect(thankYouText).to.equal("Thank you for your order!");

    // Complete text
    const completeEl = await driver.findElement(
      By.css('[data-test="complete-text"]'),
    );
    const completeText = await completeEl.getText();
    expect(completeText).to.equal(
      "Your order has been dispatched, and will arrive just as fast as the pony can get there!",
    );

    // Back home button
    const backHomeBtn = await driver.findElement(
      By.css("button.btn.btn_primary.btn_small"),
    );
    expect(await backHomeBtn.isDisplayed()).to.be.true;
  });

  // Test #25
  it("Test#25 - verification of Back home button on the complete Page", async () => {
    // Back home button
    const backHomeBtn = await driver.findElement(
      By.css("button.btn.btn_primary.btn_small"),
    );
    expect(await backHomeBtn.isDisplayed()).to.be.true;

    await backHomeBtn.click();

    const titleProductEl = await driver.findElement(
      By.css('span.title[data-test="title"]'),
    );
    const titleProductText = await titleProductEl.getText();
    expect(titleProductText).to.equal("Products");
  });
});
