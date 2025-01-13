import puppeteer, { Page } from 'puppeteer';
import { login } from './modules/Login';
import { information } from './modules/Infomation';
import { agence } from './modules/Agence';
import {simulateHumanBehavior} from "./modules/Human";

const main = async (loginIndex: number): Promise<void> => {
    const browser = await puppeteer.launch({ headless: false });
    const page: Page = await browser.newPage();

    const screenDimensions = await page.evaluate(() => ({
        width: window.screen.width,
        height: window.screen.height,
    }));
    await page.setViewport({ width: screenDimensions.width, height: screenDimensions.height });

    try {
        // Pass the index to the login function
        await login(page, loginIndex);
        // await simulateHumanBehavior(page)
        await information(page);
        await simulateHumanBehavior(page)
        await agence(page);
        await simulateHumanBehavior(page)

    } catch (error) {
        console.error(`Error in main function with login index ${loginIndex}:`, (error as Error).message);
    } finally {
        await browser.close();
    }
};

const randomDelay = (min: number, max: number) =>
    Math.floor(Math.random() * (max - min + 1)) + min;

const shouldRunDuringDaytime = (): boolean => {
    const currentHour = new Date().getHours();
    if (currentHour >= 8 && currentHour < 24) {
        return true;
    } else {
        // Generate a random number between 1 and 4; only run if it's 1
        return Math.random() < 0.150;
    }
    // Default to true outside 8 AM to midnight
};

const runEveryMinute = async (): Promise<void> => {
    let loginIndex = 0; // Initialize with the first login index

    while (true) {
        console.log(`Starting main function with login index ${loginIndex}...`);

        try {
            if (shouldRunDuringDaytime()) {
                await main(loginIndex);

                // Alternate between login index 0 and 1
                loginIndex = (loginIndex + 1) % 1 // Fixed to alternate correctly
            } else {
                console.log('Skipping this execution (1 in 4 chance did not trigger).');
            }
        } catch (error) {
            console.error('Error in runEveryMinute:', (error as Error).message);
        }

        const delay = randomDelay(13 * 60 * 1000, 15 * 60 * 1000); // Random delay between 15 to 17 minutes
        console.log(`Waiting for ${Math.round(delay / 1000 / 60)} minutes before the next execution...`);
        await new Promise((resolve) => setTimeout(resolve, delay));
    }
};

runEveryMinute();
