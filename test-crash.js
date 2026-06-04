const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  
  page.on('console', msg => {
    console.log(`[Browser Console ${msg.type()}]`, msg.text());
  });

  page.on('pageerror', err => {
    console.log('[Browser Error]', err.message);
    console.log(err.stack);
  });

  console.log('Navigating...');
  try {
    await page.goto('http://localhost:3001/368781?table=1&auth=nfc&token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9', { waitUntil: 'domcontentloaded' });
  } catch(e) {
    console.error('Navigation error:', e);
  }

  await new Promise(r => setTimeout(r, 5000));
  await browser.close();
})();
