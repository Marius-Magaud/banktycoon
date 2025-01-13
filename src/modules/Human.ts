import { Page } from 'puppeteer';

const urls = [
  "https://v4.banktycoon.com/security/",
  "https://v4.banktycoon.com/security/hackers",
  "https://v4.banktycoon.com/security/bots",
  "https://v4.banktycoon.com/security/attacks",
  "https://v4.banktycoon.com/security/bots/marketplace",
  "https://v4.banktycoon.com/office/",
  "https://v4.banktycoon.com/office/buildinglist",
  "https://v4.banktycoon.com/finance/",
  "https://v4.banktycoon.com/finance/marche/cac40",
  "https://v4.banktycoon.com/finance/marche/dowjones",
  "https://v4.banktycoon.com/finance/marche/nasdaq100",
  "https://v4.banktycoon.com/finance/marche/nikkei",
  "https://v4.banktycoon.com/chat/",
  "https://v4.banktycoon.com/derivatives/",
  "https://v4.banktycoon.com/finance/analyse",
  "https://v4.banktycoon.com/wiki/"
];

function getRandomUrls(urls: string[], count: number): string[] {
    const shuffled = urls.sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
}


/**
 * Navigates to a page simulating human-like behavior.
 * @param page The Puppeteer Page instance.
 * @param pageIndex The page index (0 to 4).
 */
async function navigatePage(page: Page, pageIndex: number): Promise<void> {



  const pageUrls =getRandomUrls(urls, pageIndex);

  // Simulate visiting each URL on the page
  for (const url of pageUrls) {
    console.log(`Visiting: ${url}`);
    const waitTime1 = getRandomInterval(5000, 15000);
    await sleep(waitTime1);

    // Navigate to the URL
    await page.goto(url, { waitUntil: 'networkidle2' });

    // Wait between 5 to 15 seconds before next navigation
    const waitTime = getRandomInterval(5000, 15000);
    console.log(`Waiting for ${waitTime / 1000} seconds before next navigation.`);
    await sleep(waitTime);
  }
}

/**
 * Returns a random interval in milliseconds between min and max.
 * @param min Minimum interval in milliseconds.
 * @param max Maximum interval in milliseconds.
 */
function getRandomInterval(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Sleeps for the specified duration in milliseconds.
 * @param ms Duration to sleep in milliseconds.
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Main function to simulate human-like navigation across pages.
 * @param page The Puppeteer Page instance.
 */
async function simulateHumanBehavior(page: Page): Promise<void> {
    const pageAmount = Math.floor(Math.random() * 5) + 1; // Generate a random number between 1 and 5
    console.log(`Navigating to page ${pageAmount}`);
    await navigatePage(page, pageAmount);
    return ;
}

export { simulateHumanBehavior };
