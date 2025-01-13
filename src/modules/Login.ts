import puppeteer, { Page } from 'puppeteer';

// Array of login credentials
const loginCredentials = [
    { username: 'marius.magaud@gmail.com', password: 'Carariton2000' },
    { username: 'kersneomague@gmail.com', password: 'Carariton2000' },
];

const loginPart1 = async (page: Page, index: number): Promise<void> => {
    try {
        // Validate the index
        if (index < 0 || index >= loginCredentials.length) {
            throw new Error('Invalid login credentials index');
        }

        const { username, password } = loginCredentials[index];

        // Navigate to the login page
        await page.goto('https://banktycoon.com/login', { waitUntil: 'networkidle2' });

        // Wait for the input fields to load
        await page.waitForSelector('#inputUsername');
        await page.waitForSelector('#inputPassword');

        // Fill in the username and password fields
        await page.type('#inputUsername', username);
        await page.type('#inputPassword', password);

        // Click the login button
        await page.click('button[type="submit"]');

        // Wait for navigation or successful login
        await page.waitForNavigation({ waitUntil: 'networkidle2' });

        console.log('Login successful for user:', username);
    } catch (error) {
        console.error('Error during loginPart1:', (error as Error).message);
    }
};

const loginPart2 = async (page: Page): Promise<void> => {
    try {
        // Wait for the button to load on the next page
        await page.waitForSelector('#s4-connect');

        // Click the button
        await page.click('#s4-connect');

        console.log('Button #s4-connect clicked!');
    } catch (error) {
        console.error('Error during loginPart2:', (error as Error).message);
    }
};

export const login = async (page: Page, index: number): Promise<void> => {
    await loginPart1(page, index);
    await loginPart2(page);
};
