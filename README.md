![Node.js](https://img.shields.io/badge/Node.js-18.x%2B-339933?style=for-the-flat&logo=node.js&logoColor=white)
![React](https://img.shields.io/badge/Frontend-React_18-61DAFB?style=for-the-flat&logo=react&logoColor=white)
![Tailwind](https://img.shields.io/badge/Style-Tailwind_CSS-38B2AC?style=for-the-flat&logo=tailwind-css&logoColor=white)
![JSON Server](https://img.shields.io/badge/Backend-json--server_0.17.4-000000?style=for-the-flat&logo=json&logoColor=white)
![Status](https://img.shields.io/badge/Status-Prototype_Phase_2-orange?style=for-the-flat)

# GreenWind Project - EuroSkills 2027 Prototype

This repository contains the prototype solution for **GreenWind**, developed as part of the EuroSkills 2027 recruitment task. The project aims to assist wind turbine planners in optimizing energy yields through digital terrain analysis and simulation.

The current release implements **Part 1 (Data Import)** and **Part 2 (Map UI & Turbine Placement)**.

---

## 📚 Project Architecture

The solution uses a decoupled architecture separating data ingestion, persistence, and visualization.

| Module | Type | Description | Status |
| :--- | :--- | :--- | :--- |
| **Import Script** | **CLI Tool** | Advanced ETL pipeline to process ASCII grid maps and binary images into structured JSON. | ✅ **Completed** |
| **API Backend** | **REST Service** | `json-server` serving as the persistence layer for project data (`database.json`). | ✅ **Completed** |
| **Map View** | **Frontend** | React-based SPA (Single Page Application) for visualizing terrain and interactive turbine placement. | ✅ **Completed** |
| **Simulation** | **Service** | Physics engine to calculate power output based on wind modifiers. | 🚧 *Planned* |

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
* **Project Dashboard:** Visual gallery of imported maps with terrain composition statistics (Grass/Lake/Mountain counts).
* **Grid Visualization:** 20x20 interactive grid overlay on the satellite map.
* **Turbine Placement:**
    * **Drag & Click:** Place turbines on valid terrain.
    * **Validation Rules:** Turbines can only be placed on **Grass** and must respect the **Exclusion Zone** (cannot be adjacent to another turbine).
    * **Visual Feedback:** Animated icons for turbines and red warning indicators for invalid moves.
* **Real-time Persistence:** All changes are immediately saved to the backend via API.

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