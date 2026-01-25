const fs = require('node:fs');
const path = require('node:path');
const { v4: uuidv4 } = require('uuid');
const axios = require('axios');

const API_URL = 'http://localhost:3000/projects';
const GRID_SIZE = 20;
const EXPECTED_CELL_COUNT = GRID_SIZE * GRID_SIZE; // 400

/**
 * Colored console helpers
 */
const colors = {
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    cyan: '\x1b[36m',
    reset: '\x1b[0m'
};

function exitWithError(message) {
    console.error(`${colors.red}[ERROR]${colors.reset} ${message}`);
    process.exit(1);
}

/**
 * ---------------------------------------------------------
 * Import Pipeline (ETL Process)
 * ---------------------------------------------------------
 */
const CELL_TYPE_MAP = { 'O': 'Grass', 'o': 'Grass', 'X': 'Lake', 'x': 'Lake', '#': 'Mountain' };

function parseMapFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split(/\r?\n/).filter(line => line.length > 0);
    const cells = [];

    if (lines.length !== GRID_SIZE)
        console.warn(`${colors.yellow}[WARN]${colors.reset} The map height is not ${GRID_SIZE} rows (found: ${lines.length}).`);

    lines.forEach((lineStr, y) => {
        [...lineStr].forEach((char, x) => {
            const type = CELL_TYPE_MAP[char];
            if (type) {
                cells.push({ x, y, type, hasTurbine: false });
            }
        });
    });
    return cells;
}

function encodeImageToBase64(filePath) {
    const fileData = fs.readFileSync(filePath);
    return `data:image/png;base64,${fileData.toString('base64')}`;
}

async function runImportPipeline(folderPath) {
    // 1. Validation
    if (!folderPath)
        exitWithError('Please provide a folder path!');

    const txtPath = path.join(folderPath, 'map.txt');
    const pngPath = path.join(folderPath, 'map.png');

    if (!fs.existsSync(txtPath))
        exitWithError(`Missing file: ${txtPath}`);

    if (!fs.existsSync(pngPath))
        exitWithError(`Missing file: ${pngPath}`);

    const projectName = path.basename(folderPath);
    console.log(`${colors.cyan}[INFO]${colors.reset} Importing: ${folderPath}...`);
    try {
        // 2. Duplication check
        const checkRes = await axios.get(`${API_URL}?name=${projectName}`);
        if (checkRes.data.length > 0) {
            exitWithError(`The project '${projectName}' already exists in the database!`);
        }

        // 3. Data transformation
        const projectData = {
            id: uuidv4(),
            name: projectName,
            mapData: encodeImageToBase64(pngPath),
            cells: parseMapFile(txtPath)
        };

        // 4. Saving
        const res = await axios.post(API_URL, projectData);
        if (res.status === 201) {
            console.log(`${colors.green}[SUCCESS]${colors.reset} Project successfully imported with ${projectData.id} ID!`);
        }

    } catch (error) {
        handleAxiosError(error);
    }
}

/**
 * ---------------------------------------------------------
 * Listing (-l/-L) Command Handler
 * ---------------------------------------------------------
 */
async function handleListCommand(subCommand) {
    try {
        const response = await axios.get(API_URL);
        const projects = response.data;

        if (projects.length === 0) {
            console.log(`${colors.yellow}The database is empty.${colors.reset}`);
            return;
        }

        console.table(projects.map(p => ({
        Name: p.name,
        ID: p.id,
        Cells: p.cells.length
        })));
    } catch (error) {
        handleAxiosError(error);
    }
}

/**
 * ---------------------------------------------------------
 * Help and Error Handling
 * ---------------------------------------------------------
 */
function printHelp() {
console.log(`
${colors.cyan}GreenWind Import Tool - Usage Guide${colors.reset}
-------------------------------------------
Usage:
${colors.yellow}node import-map.js <command>${colors.reset}

Commands:
${colors.green}-f <path>${colors.reset}  |  Import project from the specified folder (e.g., ./assets/Mariager)
${colors.green}-l${colors.reset}         |  List projects (table view)
${colors.green}-h${colors.reset}         |  This help message
`);
}

function handleAxiosError(error) {
    console.error(`${colors.red}[NETWORK ERROR]${colors.reset}`);
    if (error.code === 'ECONNREFUSED') {
        console.error("Failed to connect to the server. Is the json-server running on port 3000?");
    } else {
        console.error(error.message);
    }
    process.exit(1);
}

/**
 * ---------------------------------------------------------
 * MAIN ENTRY POINT
 * ---------------------------------------------------------
 */
(async function main() {
    const arg1 = process.argv[2];
    const arg2 = process.argv[3];

    if (!arg1 || ['-h', '-H', '-help', '-Help'].includes(arg1)) {
        printHelp();
        return;
    }

    if (['-f', '-F', '-file', '-File'].includes(arg1)) {
        await runImportPipeline(arg2);
    } else if (['-l', '-L', '-ls', '-list', '-List'].includes(arg1)) {
        await handleListCommand(arg2);
    } else if (fs.existsSync(arg1)) {
        await runImportPipeline(arg1);
    } else {
        console.error(`${colors.red}[ERROR]${colors.reset} Unknown command or path: ${arg1}`);
        console.log(`${colors.cyan}[INFO]${colors.reset} Use '${colors.green}node import-map.js -h${colors.reset}' for guidance.`);
        process.exit(1);
    }
})();