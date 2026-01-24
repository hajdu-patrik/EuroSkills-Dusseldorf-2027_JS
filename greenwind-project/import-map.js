const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const http = require('http');

// Basic configuration
const API_URL = 'http://localhost:3000/projects';
const GRID_SIZE = 20;


/**
 * Helper function to print error message and exit
 */
function exitWithError(message) {
    const errorPrefix = '\x1b[31m[ERROR]\x1b[0m';
    console.error(`${errorPrefix} ${message}`);
    process.exit(1);
}


/**
 * 1. Input parameter validation
 */
const folderPath = process.argv[2];
if (!folderPath) {
    exitWithError('Please provide the folder path as an argument!\nUsage: node import-map.js ./assets/Mariager');
}


/**
 * 2. File existence check
 */
const txtPath = path.join(folderPath, 'map.txt');
const pngPath = path.join(folderPath, 'map.png');

if (!fs.existsSync(txtPath))
    exitWithError(`Missing .txt file: ${txtPath}`);

if (!fs.existsSync(pngPath))
    exitWithError(`Missing .png file: ${pngPath}`);

console.log(`\x1b[36m[INFO]\x1b[0m Importing project from: ${folderPath}...`);


/**
 * 3. Map (map.txt) processing
 */
const CELL_TYPE_MAP = {
    'O': 'Grass', 'o': 'Grass',
    'X': 'Lake', 'x': 'Lake',
    '#': 'Mountain',
};

function parseMapFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split(/\r?\n/).filter(line => line.length > 0);

    const cells = [];

    if (lines.length !== GRID_SIZE)
        console.warn(`\x1b[33m[WARN]\x1b[0m The map height is not ${GRID_SIZE} rows (found: ${lines.length}).`);

    lines.forEach((lineStr, y) => {
            [...lineStr].forEach((char, x) => {
                const type = CELL_TYPE_MAP[char];
                if (type) {
                    cells.push({
                        x: x,
                        y: y,
                        type: type,
                        hasTurbine: false // No turbine on cell by default
                    });
                }
            });
        });
        
    return cells;
}


/**
 * 4. Image (map.png) processing
 */
function encodeImageToBase64(filePath) {
    const fileData = fs.readFileSync(filePath);
    const base64Data = fileData.toString('base64');
    return `data:image/png;base64,${base64Data}`;
}

// Dataset preparation
const projectName = path.basename(folderPath);
const mapCells = parseMapFile(txtPath);
const mapImageBase64 = encodeImageToBase64(pngPath);

const projectData = {
    id: uuidv4(),
    name: projectName,
    mapData: mapImageBase64,
    cells: mapCells
};


/**
 * 5. Sending data to JSON Server
 */
const requestOptions = {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    }
};

const req = http.request(API_URL, requestOptions, (res) => {
    let responseBody = '';

    res.on('data', (chunk) => {
        responseBody += chunk;
    });

    res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
            console.log(`\x1b[32m[SUCCESS]\x1b[0m Project successfully imported!`);
            console.log(`ID: ${projectData.id}`);
            console.log(`Name: ${projectData.name}`);
            console.log(`Number of cells: ${projectData.cells.length}`);
        } else {
            console.error(`\x1b[31m[ERROR]\x1b[0m Server error: ${res.statusCode}`);
            console.error(responseBody);
        }
    });
});

req.on('error', (error) => {
    console.error(`\x1b[31m[ERROR]\x1b[0m Could not connect to the server.`);
    console.error(`Check if the json-server is running on port 3000!`);
    console.error(`Error details: ${error.message}`);
});

req.write(JSON.stringify(projectData));
req.end();