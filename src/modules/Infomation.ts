import { Page } from "puppeteer";

// Utility function for random delay
const randomDelay = (min: number, max: number) =>
    Math.floor(Math.random() * (max - min + 1)) + min;

// Function to simulate a delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const selectFirstOptionAndSubmit = async (page: Page): Promise<boolean> => {
    try {
        // Determine the current hour
        const currentHour = new Date().getHours();

        // Select the appropriate value based on the time
        const valueToSelect = currentHour >= 0 && currentHour < 8 ? '3600' : '900';

        const selectSelector = 'select[name="time"].form-control';
        await page.waitForSelector(selectSelector, { timeout: 5000 });

        // Scroll to the select element to simulate natural user behavior
        await page.evaluate((selector) => {
            document.querySelector(selector)?.scrollIntoView({ behavior: "smooth" });
        }, selectSelector);

        // Introduce a small random delay to simulate human-like reaction time
        await delay(randomDelay(500, 750));

        // Select the desired option dynamically
        await page.select(selectSelector, valueToSelect);

        const buttonSelector = 'button[type="submit"].btn.btn-info';
        await page.waitForSelector(buttonSelector, { timeout: 5000 });

        // Scroll to the button before clicking
        await page.evaluate((selector) => {
            document.querySelector(selector)?.scrollIntoView({ behavior: "smooth" });
        }, buttonSelector);

        // Introduce another delay before clicking the button
        await delay(randomDelay(500, 700));

        await page.click(buttonSelector);

        // Add slight variance in navigation wait
        await page.waitForNavigation({
            waitUntil: 'networkidle2',
            timeout: randomDelay(1000, 1200),
        });

        console.log('Form submitted successfully!');
        return true;
    } catch (error) {
        console.error('Error in selectFirstOptionAndSubmit:', (error as Error).message);
        return false;
    }
};

// Exporting the information function
export const information = async (page: Page): Promise<void> => {
    let continueLooping = true;
    while (continueLooping) {
        continueLooping = await selectFirstOptionAndSubmit(page);

        // Introduce a delay between iterations to mimic user pacing
        if (continueLooping) {
            await delay(randomDelay(600, 1000));
        }
    }
};
