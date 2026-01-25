# AI Statement
As a competitor I understand that:

* [ ✅ ] AI may be used during the completion of the Test Project by me and others,
* [ ✅ ] I also understand that AI usage will be disabled following this round of competition,
* [ ✅ ] I accept that for a fair competition I will list my AI usage and some example prompts I used during the completion of this round.

## I used AI in the following manner (select one or more):
* [ ❌ ] I didn't use AI in any way shape or form
* [ ✅ ] I used Chat AIs like ChatGPT, Gemini etc
* [ ✅ ] I used AI Agents like Antigravity, Cursor etc

## I used AI to help me in the following (select one or more):
* [ ❌ ] I didn't use AI in any way shape or form
* [ ❌ ] I used AI to help me understand the Test Project better
* [ ✅ ] I used AI to describe function implementations which I later used to implement the function on my own
* [ ✅ ] I used AI to implement me functions which I later reworked and inserted into the code
* [ ❌ ] I used AI to implement the main parts of the Test Project for me and I finalised the results myself
* [ ❌ ] I made the solution using only AI
* [ ❌ ] Other (please specify): ...

---

## During my usage I used the following prompts (describe up to 5 prompts):

### I used Gemini 3.0 Pro as my AI model of choice.

### Prompt #1
Refactor this HTTP POST code snippet to using axios instead of the built-in http module:
```JavaScript
const http = require('http');

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
```

### Respone for my Prompt #1:
```JavaScript
const axios = require('axios');

(async () => {
    try {
        const response = await axios.post(API_URL, projectData);

        if (response.status >= 200 && response.status < 300) {
            console.log(`\x1b[32m[SUCCESS]\x1b[0m Project successfully imported!`);
            console.log(`ID: ${projectData.id}`);
            console.log(`Name: ${projectData.name}`);
            console.log(`Number of cells: ${projectData.cells.length}`);
        }
    } catch (error) {
        console.error(`\x1b[31m[ERROR]\x1b[0m Import failed.`);
        
        if (error.response) {
            console.error(`Server responded with status: ${error.response.status}`);
            console.error(error.response.data);
        } else if (error.request) {
            console.error(`No response received. Check if json-server is running on port 3000!`);
        } else {
            console.error(`Error details: ${error.message}`);
        }
    }
})();
```

---

### Prompt #2

Generate a folder structure for a full-stack JavaScript project that includes a Node.js backend and a React frontend.

### Respone for my Prompt #2:
```Bash
greenwind/
│
├── assets/
│   └── Mariager/
│       ├── map.png
│       └── map.txt
│
├── database.json
├── import-map.js
├── package.json
│
└── frontend/
    ├── index.html
    ├── package.json
    ├── vite.config.js
    ├── node_modules/
    │
    └── src/
        ├── main.jsx
        ├── App.jsx
        │
        ├── assets/
        │   ├── Turbine.png
        │   └── Exclusion.png
        │
        ├── services/
        │   └── api.js
        │
        └── pages/
            ├── ProjectList.jsx
            ├── MapEditor.jsx
            └── MapEditor.css
```

---

### Prompt #3

Help me to implement into MapEditor.jsx a feature that communicate with backend API to fetch and display a list of projects.

### Respone for my Prompt #3:
```JavaScript
const MapEditor = () => {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hoveredCell, setHoveredCell] = useState(null);

  useEffect(() => {
    api.getProject(id).then(res => {
      setProject(res.data);
      setLoading(false);
    });
  }, [id]);

  const checkNeighbors = (targetX, targetY, cells) => {
    const directions = [[-1, -1], [0, -1], [1, -1], [-1, 0], [1, 0], [-1, 1], [0, 1], [1, 1]];
    for (let [dx, dy] of directions) {
      const neighbor = cells.find(c => c.x === targetX + dx && c.y === targetY + dy);

      if (neighbor && neighbor.hasTurbine)
        return true;
    }
    return false;
  };
```