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

  // Test #7
  it("Test#7 - list of products greater than zero on the product Page", async () => {
    // Wait 5 sec and find element
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

    // Use the correct values
    await usernameField.sendKeys("standard_user");
    await passwordField.sendKeys("secret_sauce");

    await loginButton.click();

    await driver.wait(until.urlContains("inventory.html"), 10000);
    const products = await driver.findElements(
      By.css('div.inventory_item[data-test="inventory-item"]'),
    );
    expect(products.length).to.be.greaterThan(0);
  });

  // Test #8
  it("Test#8 - check all elements(name, price, desc, btn, add to cart,img) for random product on the product Page ", async () => {
    await driver.wait(until.urlContains("inventory.html"), 10000);
    const products = await driver.findElements(
      By.css('div.inventory_item[data-test="inventory-item"]'),
    );

    expect(products.length).to.be.greaterThan(0);

    // Select the random product from the product list 
    const randomIndex = Math.floor(Math.random() * products.length);
    const product = products[randomIndex];

    // Check a random product name
    const nameEl = await product.findElement(By.css("div.inventory_item_name"));
    const name = await nameEl.getText();

    expect(name).to.not.be.empty;

    // Check a random product description
    const descEl = await product.findElement(By.css("div.inventory_item_desc"));
    const desc = await descEl.getText();
    expect(desc).to.not.be.empty;

    // Check a random product price
    const priceEl = await product.findElement(
      By.css("div.inventory_item_price"),
    );
    const price = await priceEl.getText();
    console.log("Price:", price);
    expect(price).to.not.be.empty;

    // Check the button "Add to cart" for random product name
    const btnEl = await product.findElement(By.css("button.btn"));
    const btnText = await btnEl.getText();
    expect(btnText).to.equal("Add to cart");
  });

  // Test #9
  it("Test#9 - Add random product to the basket and verify count on the product Page", async () => {
    // Select the random product name
    const products = await driver.findElements(
      By.css('div.inventory_item[data-test="inventory-item"]'),
    );
    const randomIndex = Math.floor(Math.random() * products.length);
    const product = products[randomIndex];

    // Get the product name 
    const productName = await product
      .findElement(By.css(".inventory_item_name"))
      .getText();

    // Find the button for random product
    const btnEl = await product.findElement(By.css("button.btn_inventory"));

    await btnEl.click();

    // Wait 5 sec when the button will be "Remove"
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

    // Check the "Remove" button text
    const btnTextAfterClick = await product
      .findElement(By.css("button.btn_inventory"))
      .getText();
    expect(btnTextAfterClick).to.equal("Remove");

    // Check the count of product in basket
    const bucket = await driver.findElement(By.css("a.shopping_cart_link"));
    const bucketCountText = await bucket.getText();

    const bucketCount = parseInt(bucketCountText, 10);
    expect(bucketCount).to.equal(1);
  });

  // Test #10
  it("Test#10 - Remove the product from the bucket", async () => {
    // Select the product with Remove" button 
    const removeBtn = await driver.findElement(
      By.css("button.btn.btn_secondary.btn_small.btn_inventory"),
    );
    removeBtn.click();

    const bucket = await driver.findElement(By.css("a.shopping_cart_link"));

    // Find a span element 
    const spans = await bucket.findElements(By.css("span"));

    expect(spans.length).to.equal(0);
  });

  // Test #11
  it("Test#11 - filter name verification from Z to A on the product Page", async () => {
    const products = await driver.findElements(
      By.css("div.inventory_item_name"),
    );

    const productNames = [];
    for (let i = 0; i < products.length; i++) {
      const name = await products[i].getText();
      productNames.push(name);
    }

    // Sort the name by Z-A
    const sortedNames = [...productNames].sort().reverse(); // Z → A

    const sortDropdown = await driver.findElement(
      By.css("select.product_sort_container"),
    );
    await sortDropdown.findElement(By.css('option[value="za"]')).click();

    // Get the product after sorting
    const sortedProducts = await driver.findElements(
      By.css("div.inventory_item_name"),
    );
    const sortedProductNames = [];
    for (let i = 0; i < sortedProducts.length; i++) {
      sortedProductNames.push(await sortedProducts[i].getText());
    }
    expect(sortedProductNames).to.deep.equal(sortedNames);
  });

  // Test #12
  it("Test#12 - filter name verification from A to Z on the product Page", async () => {
    const products = await driver.findElements(
      By.css("div.inventory_item_name"),
    );

    const productNames = [];
    for (let i = 0; i < products.length; i++) {
      const name = await products[i].getText();
      productNames.push(name);
    }

    // Sort name by A-Z
    const sortedNames = [...productNames].sort(); // A → Z

    const sortDropdown = await driver.findElement(
      By.css("select.product_sort_container"),
    );
    await sortDropdown.findElement(By.css('option[value="az"]')).click();

    // Get the product after sorting
    const sortedProducts = await driver.findElements(
      By.css("div.inventory_item_name"),
    );
    const sortedProductNames = [];
    for (let i = 0; i < sortedProducts.length; i++) {
      sortedProductNames.push(await sortedProducts[i].getText());
    }
    expect(sortedProductNames).to.deep.equal(sortedNames);
  });

  // Test #13
  it("Test#13 - filter price verification from low to high on the product Page ", async () => {
    const products = await driver.findElements(
      By.css("div.inventory_item_price"),
    );

    const productPrices = [];
    for (let i = 0; i < products.length; i++) {
      const priceText = await products[i].getText(); // "$29.99"
      const price = parseFloat(priceText.replace("$", "")); // 29.99
      productPrices.push(price);
    }

    // Sort the price by (low → high)
    const sortedPrices = [...productPrices].sort((a, b) => a - b);

    const sortDropdown = await driver.findElement(
      By.css("select.product_sort_container"),
    );
    await sortDropdown.findElement(By.css('option[value="lohi"]')).click();

    // Get the price after sorting
    const sortedProducts = await driver.findElements(
      By.css("div.inventory_item_price"),
    );
    const sortedProductPrice = [];
    for (let i = 0; i < sortedProducts.length; i++) {
      const priceText = await sortedProducts[i].getText(); // "$29.99"
      const priceNumber = parseFloat(priceText.replace("$", "")); // 29.99
      sortedProductPrice.push(priceNumber);
    }
    expect(sortedPrices).to.deep.equal(sortedProductPrice);
  });

  // Test #14
  it("Test#14 - filter price verification from high to low on the product Page", async () => {
    const products = await driver.findElements(
      By.css("div.inventory_item_price"),
    );

    const productPrices = [];
    for (let i = 0; i < products.length; i++) {
      const priceText = await products[i].getText(); // "$29.99"
      const price = parseFloat(priceText.replace("$", "")); // 29.99
      productPrices.push(price);
    }

    // Sort the price (high → low)
    const sortedPricesDesc = [...productPrices].sort((a, b) => b - a);

    const sortDropdown = await driver.findElement(
      By.css("select.product_sort_container"),
    );
    await sortDropdown.findElement(By.css('option[value="hilo"]')).click();

    // Get the price after sorting
    const sortedProducts = await driver.findElements(
      By.css("div.inventory_item_price"),
    );
    const sortedProductPrice = [];
    for (let i = 0; i < sortedProducts.length; i++) {
      const priceText = await sortedProducts[i].getText(); // "$29.99"
      const priceNumber = parseFloat(priceText.replace("$", "")); // 29.99
      sortedProductPrice.push(priceNumber);
    }

    expect(sortedPricesDesc).to.deep.equal(sortedProductPrice);
  });

  // Test #15
  it("Test#15 - the whole basket verification with one product ", async () => {
    // Select the random product
    const products = await driver.findElements(
      By.css('div.inventory_item[data-test="inventory-item"]'),
    );
    const randomIndex = Math.floor(Math.random() * products.length);
    const product = products[randomIndex];

    // Get the name of random product
    const productName = await product.findElement(
      By.css("div.inventory_item_name"),
    );
    const productNameText = await productName.getText();

    // Get the price of random product
    const productPrice = await product.findElement(
      By.css("div.inventory_item_price"),
    );
    const productPriceText = await productPrice.getText();

    // Get the description of random product
    const productDesc = await product.findElement(
      By.css("div.inventory_item_desc"),
    );
    const productDescText = await productDesc.getText();

    const addBtn = await product.findElement(By.css("button.btn_primary"));
    addBtn.click();

    const bucketEl = await driver.findElement(By.css("a.shopping_cart_link"));
    const spans = await bucketEl.findElements(By.css("span"));
    expect(spans.length).to.equal(1);

    bucketEl.click();
    // Wait 5 sec 
    const cartList = await driver.wait(
      until.elementLocated(By.css("div.cart_list")),
      5000, // таймаут в мс
    );

    // Get the product name in basket
    const productNameEl = await cartList.findElement(
      By.css("div.inventory_item_name"),
    );
    const productNameInBusket = await productNameEl.getText();

    // Get the product description in basket
    const productDescEl = await cartList.findElement(
      By.css("div.inventory_item_desc"),
    );
    const productDescInBusket = await productDescEl.getText();

    // Get the product price in basket
    const productPriceEl = await cartList.findElement(
      By.css("div.inventory_item_price"),
    );
    const productPriceInBusket = await productPriceEl.getText();

    // Get the button "Continue"
    const continueBtnEl = await driver.findElement(
      By.css("button.btn.btn_secondary.back.btn_medium"),
    );
    const continueBtn = await continueBtnEl.getText();

    // Get the "Finish" button
    const checkoutBtnEl = await driver.findElement(
      By.css("button.btn.btn_action.btn_medium.checkout_button"),
    );
    const checkoutBtn = await checkoutBtnEl.getText();

    // Get the count of product
    const cartquantityEl = await driver.findElement(
      By.css("div.cart_quantity"),
    );
    const cartquantity = await cartquantityEl.getText();

    expect(productNameText).to.equal(productNameInBusket);
    expect(productDescText).to.equal(productDescInBusket);
    expect(productPriceText).to.equal(productPriceInBusket);
    expect(continueBtn).to.equal("Continue Shopping");
    expect(checkoutBtn).to.equal("Checkout");
    expect(parseInt(cartquantity, 10)).to.equal(1);
  });
});
