import puppeteer, { ElementHandle } from "puppeteer";
import { Page } from "puppeteer";

// Function to navigate to the country URL and wait for the table to load
const navigateToPage = async (page: Page, country_url: string, tableSelector: string): Promise<void> => {
    await page.goto(country_url, { waitUntil: 'networkidle2' });
    await page.waitForSelector(tableSelector, { timeout: 5000 });
    console.log("Page et tableau chargés.");
};

// Function to detect column indices for "Amélioration" and "Revenus"
const getColumnIndices = async (page: Page, tableSelector: string): Promise<{ Amelioration_index: number; Revenue_index: number }> => {
    const headersSelector = `${tableSelector} thead th`;
    const headers = await page.$$(headersSelector);

    let Revenue_index = 4; // Default to column 4 for "Revenus"
    let Amelioration_index = -1; // Default to -1 (not found)

    for (let i = 0; i < headers.length; i++) {
        const text = await headers[i].evaluate((el) => el.textContent?.trim() || "");
        if (text === "Amélioration") {
            Amelioration_index = i + 1; // CSS index starts at 1
            Revenue_index = i + 2; // "Revenus" is the column after "Amélioration"
            break;
        }
    }

    if (Amelioration_index !== -1) {
        console.log("Colonne 'Amélioration' détectée.");
    } else {
        console.log("Colonne 'Amélioration' non détectée.");
    }

    return { Amelioration_index, Revenue_index };
};

// Function to count non-empty cells in the "Amélioration" column
const countNonEmptyAmeliorationCells = async (page: Page, tableSelector: string, Amelioration_index: number): Promise<number> => {
    if (Amelioration_index === -1) return 0;

    const ameliorationSelector = `${tableSelector} tbody tr td:nth-child(${Amelioration_index})`;
    const ameliorationCells = await page.$$(ameliorationSelector);

    let nonEmptyCount = 0;
    for (const cell of ameliorationCells) {
        const text = await cell.evaluate((el) => el.textContent?.trim() || "");
        if (text) {
            nonEmptyCount++;
        }
    }

    console.log(`Nombre de cases non vides dans la colonne 'Amélioration' : ${nonEmptyCount}`);
    return nonEmptyCount;
};

// Function to find the target row based on conditions
const findTargetRow = async (
    page: Page,
    tableSelector: string,
    Revenue_index: number,
    Amelioration_index: number
): Promise<ElementHandle<Element> | null> => {
    const rowsSelector = `${tableSelector} tbody tr`;
    const rows = await page.$$(rowsSelector);

    let lowestRevenue = Number.MAX_SAFE_INTEGER;
    let targetRow: ElementHandle<Element> | null = null;

    for (const row of rows) {
        const revenusSelector = `td:nth-child(${Revenue_index})`;
        const ameliorationSelector = Amelioration_index !== -1 ? `td:nth-child(${Amelioration_index})` : null;

        const revenusText = await row.$eval(revenusSelector, (cell) => cell.textContent?.trim() || "0");
        const revenus = parseInt(revenusText.replace(/\s/g, ""), 10); // Remove spaces and convert to number

        let ameliorationText = "";
        if (ameliorationSelector) {
            ameliorationText = await row.$eval(ameliorationSelector, (cell) => cell.textContent?.trim() || "");
        }

        if ((ameliorationText === "" || Amelioration_index === -1) && revenus > 0 && revenus < lowestRevenue) {
            lowestRevenue = revenus;
            targetRow = row;
        }
    }

    if (targetRow) {
        console.log(`Ligne sélectionnée avec Revenus = ${lowestRevenue}`);
    } else {
        console.log("Aucune ligne valide trouvée pour le clic.");
    }

    return targetRow;
};

// Function to click the target row
const clickTargetRow = async (targetRow: ElementHandle<Element> | null): Promise<void> => {
    if (targetRow) {
        const firstCellSelector = 'td:first-child a';
        const clickableCell = await targetRow.$(firstCellSelector);

        if (clickableCell) {
            await clickableCell.click();
        } else {
            await targetRow.$eval('td:first-child', (cell: HTMLElement) => cell.click());
        }

        console.log("Ligne cliquée.");
    }
};

// Function to click the last "Améliorer" button
const clickLastImproveButton = async (page: Page): Promise<void> => {
    const lastImproveButtonSelector = 'form.inline button.btn.btn-success:last-of-type';
    await page.waitForSelector(lastImproveButtonSelector, { timeout: 5000 });
    await page.click(lastImproveButtonSelector);
};



// Utility function for random delay
const randomDelay = (min: number, max: number) =>
    Math.floor(Math.random() * (max - min + 1)) + min;

// Function to simulate a delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Main function to run the process in a loop
const run_country = async (page: Page, country_url: string): Promise<void> => {
    const tableSelector = "#table_agences";

    try {
        await navigateToPage(page, country_url, tableSelector);
        let continueProcessing = true;

        while (continueProcessing) {
            const { Amelioration_index, Revenue_index } = await getColumnIndices(page, tableSelector);
            const nonEmptyAmeliorationCount = await countNonEmptyAmeliorationCells(page, tableSelector, Amelioration_index);

            console.log(`Amélioration non vide : ${nonEmptyAmeliorationCount}`);

            // Vérifier si l'on doit continuer le traitement
            if (nonEmptyAmeliorationCount >= 4) {
                console.log("Amélioration >= 4. Arrêt du processus.");
                continueProcessing = false;
                break;
            }

            const targetRow = await findTargetRow(page, tableSelector, Revenue_index, Amelioration_index);

            if (targetRow) {
                // Introduce a random delay before clicking the target row
                await delay(randomDelay(500, 1500));
                await clickTargetRow(targetRow);
            } else {
                console.log("Aucune ligne restante avec Revenus > 0 et Amélioration vide. Arrêt du processus.");
                continueProcessing = false;
                break;
            }

            // Routine pour cliquer sur le dernier bouton "Améliorer"
            await delay(randomDelay(500, 1500)); // Add a delay before clicking
            await clickLastImproveButton(page);

            // Simulate navigation and waiting
            await delay(randomDelay(2000, 4000));
            await navigateToPage(page, country_url, tableSelector);

            // Vérifier après chaque clic si toutes les colonnes d'amélioration sont remplies
            const updatedNonEmptyAmeliorationCount = await countNonEmptyAmeliorationCells(
                page,
                tableSelector,
                Amelioration_index
            );
            const totalRows = await page.$$eval(`${tableSelector} tbody tr`, (rows) => rows.length);

            if (updatedNonEmptyAmeliorationCount >= totalRows) {
                console.log("Toutes les colonnes d'amélioration sont remplies. Arrêt du processus.");
                continueProcessing = false;
            }

            // Introduce a pause between iterations
            await delay(randomDelay(3000, 6000));
        }

        console.log("Processus terminé.");
    } catch (error) {
        console.error("Erreur lors du traitement du tableau :", (error as Error).message);
    }
};



export const agence = async (page: Page): Promise<void> => {
    const country_url = [
        "https://v4.banktycoon.com/agences/pays/LU",
        "https://v4.banktycoon.com/agences/pays/RU",
        "https://v4.banktycoon.com/agences/pays/PK",
        "https://v4.banktycoon.com/agences/pays/AR",
        "https://v4.banktycoon.com/agences/pays/JP",
        "https://v4.banktycoon.com/agences/pays/NG",
    ];

    // Shuffle the country_url array
    country_url.sort(() => Math.random() - 0.5);

    for (const country of country_url) {
        console.log(`Processing country: ${country}`);
        await delay(randomDelay(2000, 5000)); // Introduce delay between country navigations
        await page.goto("https://v4.banktycoon.com/agences/", { waitUntil: 'networkidle2' });
        await delay(randomDelay(2000, 5000)); // Introduce delay between country navigations
        await run_country(page, country);
    }
};

