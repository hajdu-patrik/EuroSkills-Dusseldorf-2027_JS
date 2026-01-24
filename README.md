![Node.js](https://img.shields.io/badge/Node.js-18.x%2B-339933?style=for-the-flat&logo=node.js&logoColor=white)
![JSON Server](https://img.shields.io/badge/Backend-json--server_0.17.4-000000?style=for-the-flat&logo=json&logoColor=white)
![UUID](https://img.shields.io/badge/Library-uuid-blue?style=for-the-flat)
![Status](https://img.shields.io/badge/Status-Prototype_Phase_1-orange?style=for-the-flat)

# EuroSkills 2027 Application Project

This repository contains the prototype solution for **GreenWind**, developed as part of the EuroSkills 2027 recruitment task. The project aims to assist wind turbine planners in optimizing energy yields through digital terrain analysis and simulation.

The current release implements **Part 1: Data Import Pipeline**, a CLI tool designed to perform ETL (Extract, Transform, Load) operations on raw topographic data.

---

## 📚 Project Architecture

The solution uses a decoupled architecture separating the data ingestion layer from the persistence layer.

| Module | Type | Description | Status |
| :--- | :--- | :--- | :--- |
| **Import Script** | **CLI Tool** | Reads ASCII grid maps and binary images, transforms them into structured JSON objects, and pushes to the API. | ✅ **Completed** |
| **API Backend** | **REST Service** | A `json-server` instance serving as the persistence layer for project data (`database.json`). | ✅ **Completed** |
| **Map View** | **Frontend** | Interactive UI for visualizing the terrain and placing turbines. | 🚧 *Planned* |
| **Simulation** | **Service** | Physics engine to calculate power output based on wind modifiers. | 🚧 *Planned* |

---

## 🛠️ Technical Implementation: Import Script

Located in `import-map.js`, the script functions as a custom **Data Processing Pipeline** (using the ETL pattern):

1.  **Extract:** Validates input paths and reads raw assets (`map.txt` for terrain topology, `map.png` for visualization).
2.  **Transform:**
    * Parses ASCII characters (`O`, `X`, `#`) into semantic objects (`Grass`, `Lake`, `Mountain`).
    * Encodes binary image data into **Base64** strings for JSON compatibility.
    * Generates RFC-compliant **UUIDs** for entity identification.
3.  **Load:** Serializes the payload and executes a `POST` request to the backend API.

---

## ⚙️ Setup & Usage

To run the application, you need to execute the backend service and the import client in separate terminal instances.

### 1. Start the Backend Service
First, initialize the database server. We use the `--watch` flag to enable hot-reloading on file changes.

```bash
npx json-server --watch database.json --port 3000
```

Note: Wait until the console displays: Resources http://localhost:3000/projects before proceeding.

### 2. Execute the Import Pipeline
Once the server is running, use the CLI tool to ingest a map dataset. This command assumes your test data (e.g., the `Mariager` folder) is located in the `assets/` directory.

```bash
node import-map.js ./assets/Mariager
```

### 3. Verify Data Integrity

Upon success, the console will output the generated Project ID. You can verify the stored data by inspecting `database.json` or navigating to: `http://localhost:3000/projects`.