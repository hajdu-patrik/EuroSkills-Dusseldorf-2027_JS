![Node.js](https://img.shields.io/badge/Node.js-18.x%2B-339933?style=for-the-flat&logo=node.js&logoColor=white)
![React](https://img.shields.io/badge/Frontend-React_18-61DAFB?style=for-the-flat&logo=react&logoColor=white)
![Tailwind](https://img.shields.io/badge/Style-Tailwind_CSS-38B2AC?style=for-the-flat&logo=tailwind-css&logoColor=white)
![JSON Server](https://img.shields.io/badge/Backend-json--server_0.17.4-000000?style=for-the-flat&logo=json&logoColor=white)
![Vercel](https://img.shields.io/badge/Deployment-Vercel-000000?style=for-the-flat&logo=vercel&logoColor=white)
![Render](https://img.shields.io/badge/API_Host-Render-46E3B7?style=for-the-flat&logo=render&logoColor=white)
![Status](https://img.shields.io/badge/Status-Live_Production-success?style=for-the-flat)

# GreenWind - EuroSkills 2027

This repository contains the **final solution** for **GreenWind**, developed as part of the EuroSkills 2027 recruitment task. The project is a comprehensive tool for wind turbine planners, offering digital terrain analysis, interactive placement, and real-time energy yield simulation.

The solution fully implements **Part 1 (Data Import)**, **Part 2 (Map UI & Turbine Placement)**, and **Part 3 (Simulation & Calculations)**.

---

## 🚀 Live Production

The application is deployed to a production environment using a distributed cloud architecture.

👉 **Try the App:** **[https://es2027-s09-r1-174.vercel.app](https://es2027-s09-r1-174.vercel.app)**
*(Note: The backend runs on a free instance. Please allow ~50 seconds for the initial cold start if the data doesn't load immediately.)*

---

## ☁️ Cloud Deployment Architecture

This project utilizes a **decoupled architecture**, separating the User Interface from the Data Layer to ensure scalability and separation of concerns.

| Component | Host Service | Description | URL |
| :--- | :--- | :--- | :--- |
| **Frontend** | **Vercel** | Hosts the React SPA, handles static assets, and manages CI/CD for UI updates. | `*.vercel.app` |
| **Backend** | **Render** | Hosts the Node.js environment running `json-server` to provide the REST API. | `onrender.com` |

### How it works:
1.  **Communication:** The React frontend connects to the backend via the `VITE_API_URL` environment variable.
2.  **Persistence:** Data changes (e.g., placing a turbine) are sent from Vercel to Render, which updates the in-memory database.
3.  **CI/CD:** Pushes to the `main` branch trigger automatic deployments:
    * **Frontend:** Vercel rebuilds the React app and updates the edge network.
    * **Backend:** Render pulls the latest code and restarts the API service.

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
* **Persistence:** All changes are saved instantly to the backend via API.

### 3. Simulation Engine
* **Real-time Calculation:** Instantly updates power output based on turbine configuration.
* **Wind Physics:**
    * **Direction Control:** Adjustable wind direction (North, South, East, West).
    * **Speed Control:** Slider to adjust base wind speed (0-40 m/s).
    * **Obstacle Analysis:** Calculates wind speed reduction caused by nearby Mountains or other Turbines (Wake Effect).
* **Visual Indicators:** Dynamic arrows on the map showing local wind direction and flow.
* **Data Output:** Displays total generated power in Megawatts (MW) and Kilowatts (kW).

---

## ⚙️ Local Development Setup

To run the full application stack locally, you need to execute three components in parallel terminals.

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

---

## 📦 Deployment

This project is configured for automated deployment via **Vercel**.
Any push to the `main` branch automatically triggers a new build and deployment.

| Environment | Status |
| :--- | :--- |
| **Production** | [![Vercel App](https://img.shields.io/badge/Visit-Live_App-success?style=for-the-badge&logo=vercel)](https://es2027-s09-r1-174.vercel.app) |