const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  
  page.on('console', msg => {
    if (msg.type() === 'error') console.log('PAGE ERROR:', msg.text());
  });

  try {
    await page.goto('http://localhost:3000/?admin=true', { waitUntil: 'networkidle2' });
    
    // Check if the business_card button exists
    console.log("Looking for business card toggle...");
    await page.waitForSelector('button', { timeout: 5000 });
    
    const clicked = await page.evaluate(() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const bizBtn = btns.find(b => b.textContent.includes('بطاقة أعمال'));
        if (bizBtn) {
            bizBtn.click();
            return true;
        }
        return false;
    });

    if (clicked) {
        console.log("Clicked! Waiting for render...");
        await page.waitForTimeout(2000);
        
        // Check if AMTBusinessCard rendered
        const text = await page.evaluate(() => document.body.innerText);
        if (text.includes('AMT Tech Solutions')) {
            console.log("SUCCESS: Business card rendered.");
        } else {
            console.log("ERROR: Business card did not render. Text not found.");
        }
    } else {
        console.log("ERROR: Toggle button not found.");
    }
  } catch(e) {
    console.error("Puppeteer Error:", e.message);
  }

  await browser.close();
})();
