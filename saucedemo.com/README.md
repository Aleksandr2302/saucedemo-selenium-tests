# Saucedemo Selenium Tests

**Description:**  
This is a set of automated tests for the [Saucedemo](https://www.saucedemo.com/) training website.  
Tests are written in **JavaScript** using **Selenium WebDriver**, **Mocha**, and **Chai**. 
+CI/CD 

**Test Coverage:**  
- Login functionality: valid and invalid credentials  
- Product management: adding, removing, and verifying products in the cart  
- Checkout process: filling out information and completing the order  
- UI elements verification: buttons, titles, and product listings are displayed correctly  

---

## Project Structure
/saucedemo-tests
/test
loginPage.test.js
productPage.test.js
checkoutPage.test.js
package.json
README.md


---
## Prerequisites

1. **Install Node.js and npm**  
   Download and install from [https://nodejs.org/](https://nodejs.org/).  
   Verify installation:
   ```bash
   node -v
   npm -v
   ```
Install project dependencies

Install Selenium WebDriver (if not included in dependencies):


```bash
npm install selenium-webdriver --save
```

Install Prettier for code formatting (optional but recommended)

```bash
npm install --save-dev prettier
```

Running Tests
Run all tests:


```bash
npm test
```


Run a specific test file:


```bash
npx mocha ./test/loginPage.test.js
```
Code Formatting
To automatically format code using Prettier:


```bash
npm run format
```