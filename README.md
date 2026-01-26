![Node.js](https://img.shields.io/badge/Node.js-18.x%2B-339933?style=for-the-flat&logo=node.js&logoColor=white)
![React](https://img.shields.io/badge/Frontend-React_18-61DAFB?style=for-the-flat&logo=react&logoColor=white)
![Tailwind](https://img.shields.io/badge/Style-Tailwind_CSS-38B2AC?style=for-the-flat&logo=tailwind-css&logoColor=white)
![JSON Server](https://img.shields.io/badge/Backend-json--server_0.17.4-000000?style=for-the-flat&logo=json&logoColor=white)
![Status](https://img.shields.io/badge/Status-Completed_Release-green?style=for-the-flat)

# GreenWind - EuroSkills 2027

This repository contains the **final solution** for **GreenWind**, developed as part of the EuroSkills 2027 recruitment task. The project is a comprehensive tool for wind turbine planners, offering digital terrain analysis, interactive placement, and real-time energy yield simulation.

The solution fully implements **Part 1 (Data Import)**, **Part 2 (Map UI & Turbine Placement)**, and **Part 3 (Simulation & Calculations)**.

---

## 📚 Project Architecture

The solution uses a decoupled architecture separating data ingestion, persistence, logic calculation, and visualization.

| Module | Type | Description | Status |
| :--- | :--- | :--- | :--- |
| **Import Script** | **CLI Tool** | Advanced ETL pipeline to process ASCII grid maps and binary images into structured JSON. | ✅ **Completed** |
| **API Backend** | **REST Service** | `json-server` serving as the persistence layer for project data (`database.json`). | ✅ **Completed** |
| **Map View** | **Frontend** | React-based SPA with responsive UI for terrain visualization and turbine management. | ✅ **Completed** |
| **Simulation** | **Service** | Physics engine calculating wind attenuation, obstacle effects, and power output (MW). | ✅ **Completed** |

---

## 🛠️ Features

### 1. CLI Import Tool
* **Validation:** Checks for file existence and grid integrity (20x20).
* **Duplicate Check:** Prevents re-importing the same project name.
* **Smart Parsing:** Converts character maps (`O`, `X`, `#`) to semantic objects.
* **Commands:**
    * `node import-map.js -f <path>` - Import a folder
    * `node import-map.js -l` - List existing projects
    * `node import-map.js -h` - Help menu

### 2. Interactive Map Editor (UI)
* **Responsive Design:** Fully adaptive layout for Mobile, Tablet, and Desktop screens.
* **Project Dashboard:** Visual gallery of imported maps with terrain composition statistics (Grass/Lake/Mountain counts).
* **Turbine Placement:**
    * **Drag & Click:** Place turbines on valid terrain.
    * **Validation Rules:** Turbines can only be placed on **Grass** and must respect the **Exclusion Zone** (cannot be adjacent to another turbine).
    * **Visual Feedback:** Animated icons for turbines and red warning indicators for invalid moves.
* **Persistence:** All changes are saved instantly to the backend.

### 3. Simulation Engine
* **Real-time Calculation:** Instantly updates power output based on turbine configuration.
* **Wind Physics:**
    * **Direction Control:** Adjustable wind direction (North, South, East, West).
    * **Speed Control:** Slider to adjust base wind speed (0-40 m/s).
    * **Obstacle Analysis:** Calculates wind speed reduction caused by nearby Mountains or other Turbines (Wake Effect).
* **Visual Indicators:** Dynamic arrows on the map showing local wind direction and flow.
* **Data Output:** Displays total generated power in Megawatts (MW) and Kilowatts (kW).

---

## ⚙️ Setup & Usage

To run the full application stack, you need to execute three components in parallel terminals.

### 1. Start the Backend Service
Serves the `database.json` file as a REST API.

```bash
npx json-server --watch database.json --port 3000
```

Wait until: Resources `http://localhost:3000/projects`

### 2. Import or Add Data
If the database is empty (`database.json`), import the sample data.

```bash
node import-map.js -f <path> (e.g., ./assets/Mariager)
```

### 3. Launch the Frontend
Starts the React development server using Vite.

```bash
cd frontend
npm run dev
```

Open the provided local URL (e.g., `http://localhost:5173`) in your browser.

---

## 📦 Tech Stack
- **Node.js** - JavaScript runtime for backend and CLI tooling.
- **React** - Frontend library for building the interactive UI.
- **Tailwind CSS** - Utility-first CSS framework for styling.
- **json-server** - Mock REST API for data persistence.
- **Axios** - Promise-based HTTP client for API communication.
- **Vite** - Fast frontend build tool and development server.
