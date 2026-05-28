const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  
  // Catch console logs
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', error => console.log('PAGE ERROR:', error.message));
  page.on('requestfailed', request => console.log('REQUEST FAILED:', request.url(), request.failure().errorText));

  console.log("Navigating...");
  await page.goto('http://localhost:3000/?admin=true', { waitUntil: 'networkidle2' });

  // Wait for login or dashboard
  // Let's assume it logs us in or we need to login
  try {
    const passwordInput = await page.$('input[type="password"]');
    if (passwordInput) {
      console.log("Logging in...");
      await passwordInput.type('amt123'); // or whatever the password is
      await page.keyboard.press('Enter');
      await page.waitForNavigation({ waitUntil: 'networkidle2' }).catch(()=>null);
    }
    
    // Now look for the business_card button
    console.log("Clicking business card toggle...");
    await page.evaluate(() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const bizBtn = btns.find(b => b.textContent.includes('بطاقة أعمال'));
        if (bizBtn) bizBtn.click();
    });

    await page.waitForTimeout(2000); // Wait for crash to happen
  } catch(e) {
    console.error("Puppeteer Script Error:", e);
  }

  await browser.close();
})();
