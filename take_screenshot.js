const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });
  await page.goto('https://maroufcoffee.com/ar/', { waitUntil: 'networkidle2' });
  await page.screenshot({ path: 'marouf_screenshot.png' });
  await browser.close();
  console.log('Screenshot saved to marouf_screenshot.png');
})();
