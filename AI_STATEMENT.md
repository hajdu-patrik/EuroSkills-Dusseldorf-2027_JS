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

---

### Prompt #4

Help me to implement the grid display of the map cells in MapEditor.jsx including hover effects and tooltips showing cell information.

### Respone for my Prompt #4:
```JavaScript
<div className="absolute inset-0 z-10 grid grid-cols-20 grid-rows-20">
    {simulationData.cells.map((simCell, index) => {
    const cell = project.cells[index];
    const isHovered = hoveredCell === index;
    const isValid = canPlaceTurbine(cell, project.cells);
                
    let iconToShow = null;
    if (cell.hasTurbine) iconToShow = isHovered ? removeImg : turbineImg;
    else if (isHovered) iconToShow = isValid ? turbineImg : removeImg;

    const tooltipText = simCell.hasTurbine 
        ? `Power: ${Math.round(simCell.power)} kW\nWind: ${simCell.speed.toFixed(1)} m/s\nModifiers: ${(simCell.modifier * 100).toFixed(0)}%\n${simCell.reasons.join('\n')}`
        : `Wind: ${simCell.speed.toFixed(1)} m/s`;

        return (
            <div 
                key={`${cell.x}-${cell.y}`}
                className={getCellClasses(cell, isHovered, simCell)}
                onClick={() => handleCellClick(index)}
                onMouseEnter={() => setHoveredCell(index)}
                onMouseLeave={() => setHoveredCell(null)}
                onDragStart={(e) => e.preventDefault()}
                title={tooltipText}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleCellClick(index); }}
                >
            {cell.type !== 'Mountain' && (
            <div className="absolute inset-0 flex items-center justify-center opacity-30 pointer-events-none text-[10px] text-stone-900 font-bold select-none">
                <span className="select-none" style={{ transform: `rotate(${getArrowRotation(windDirection)}deg)` }}>➤</span>
            </div>
                )}
                {iconToShow && (
                    <img src={iconToShow} alt="status" onDragStart={(e) => e.preventDefault()}
                        className={`w-4/5 h-4/5 object-contain drop-shadow-lg pointer-events-none transform-gpu relative z-10 select-none ${!cell.hasTurbine && isHovered && isValid ? 'opacity-50' : 'opacity-100'}`} 
                    />
                )}
            </div>
        );
    })}
</div>
```

---

### Prompt #5

Fix the static analysis tools found errors and explain why the code is more efficient this way!

```SonarQube
[{
"resource": "/e:/Coding Projects/Competition/es2027-s09-r1-174/greenwind/frontend/src/pages/MapEditor.jsx",
"owner": "sonarlint",
"code": "javascript:S3776",
"severity": 4,
"message": "Refactor this function to reduce its Cognitive Complexity from 18 to the 15 allowed. [+14 locations]",
"source": "sonarqube",
"startLineNumber": 115,
"startColumn": 53,
"endLineNumber": 115,
"endColumn": 55,
"modelVersionId": 809,
"origin": "extHost1"
},{
"resource": "/e:/Coding Projects/Competition/es2027-s09-r1-174/greenwind/frontend/src/pages/MapEditor.jsx",
"owner": "sonarlint",
"code": "javascript:S6660",
"severity": 4,
"message": "'If' statement should not be the only statement in 'else' block",
"source": "sonarqube",
"startLineNumber": 130,
"startColumn": 9,
"endLineNumber": 130,
"endColumn": 11,
"modelVersionId": 809,
"origin": "extHost1"
},{
"resource": "/e:/Coding Projects/Competition/es2027-s09-r1-174/greenwind/frontend/src/pages/MapEditor.jsx",
"owner": "sonarlint",
"code": "javascript:S6848",
"severity": 4,
"message": "Avoid non-native interactive elements. If using native HTML is not possible, add an appropriate role and support for tabbing, mouse, keyboard, and touch inputs to an interactive content element.",
"source": "sonarqube",
"startLineNumber": 171,
"startColumn": 13,
"endLineNumber": 171,
"endColumn": 123,
"modelVersionId": 809,
"origin": "extHost1"
},{
"resource": "/e:/Coding Projects/Competition/es2027-s09-r1-174/greenwind/frontend/src/pages/MapEditor.jsx",
"owner": "sonarlint",
"code": "javascript:S6848",
"severity": 4,
"message": "Avoid non-native interactive elements. If using native HTML is not possible, add an appropriate role and support for tabbing, mouse, keyboard, and touch inputs to an interactive content element.",
"source": "sonarqube",
"startLineNumber": 189,
"startColumn": 19,
"endLineNumber": 197,
"endColumn": 20,
"modelVersionId": 809,
"origin": "extHost1"
},{
"resource": "/e:/Coding Projects/Competition/es2027-s09-r1-174/greenwind/frontend/src/pages/MapEditor.jsx",
"owner": "sonarlint",
"code": "javascript:S3358",
"severity": 4,
"message": "Extract this nested ternary operation into an independent statement.",
"source": "sonarqube",
"startLineNumber": 202,
"startColumn": 123,
"endLineNumber": 202,
"endColumn": 159,
"modelVersionId": 809,
"origin": "extHost1"
}]
```

### Respone for my Prompt #5:

The fixed code is as follows:

```JavaScript
// Helper to reduce complexity of getCellClasses (S3776)
const getTurbineColorClass = (power, min, max) => {
    if (min === max) return "bg-emerald-500/60";
    const ratio = (power - min) / (max - min || 1);
    if (ratio < 0.33) return "bg-red-500/60";
    if (ratio < 0.66) return "bg-orange-400/60";
    return "bg-emerald-500/60";
};
```

The code is more efficient this way because:
1. **Reduced Cognitive Complexity (S3776)**: By breaking down complex functions into smaller helper functions, the code becomes easier to read and maintain. Each function has a single responsibility, making it simpler to understand and test.

etc...

---

## Final Statement

I used AI to assist in the development of this project, I ensured that I reviewed and understood all generated code before integrating it into my solution.
