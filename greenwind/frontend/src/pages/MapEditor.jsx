import { useEffect, useState, useMemo, useCallback, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../services/api';
import NotFound from './NotFound';
import MapCell from '../components/MapCell';
import Button from '../components/ui/Button';

import { calculateWindSpeed, calculatePower, indexCellsByCoord, WIND_DIRECTIONS } from '../utils/utils';

import turbineImg from '../assets/turbine.png';
import removeImg from '../assets/remove.png';

// Turbine-placement validation. Takes the same coordinate index calculateWindSpeed already builds
// (see utils.js) instead of re-scanning the cells array, so checking all 400 cells costs O(400 x 8)
// map lookups instead of O(400 x 8 x 400) linear scans.
const checkNeighbors = (targetX, targetY, cellIndex) => {
  const directions = [[-1, -1], [0, -1], [1, -1], [-1, 0], [1, 0], [-1, 1], [0, 1], [1, 1]];
  for (let [dx, dy] of directions) {
    const neighbor = cellIndex.get((targetX + dx) + ',' + (targetY + dy));
    if (neighbor?.hasTurbine) return true;
  }
  return false;
};

const canPlaceTurbine = (cell, cellIndex) => {
  if (cell.type !== 'Grass') return false;
  if (checkNeighbors(cell.x, cell.y, cellIndex)) return false;
  return true;
};

// Helper to get arrow rotation based on wind direction
const getArrowRotation = (dir) => {
  const rotationMap = { 'East': 180, 'West': 0, 'North': 90, 'South': -90 };
  return rotationMap[dir] || 0;
};

const MapEditor = () => {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [hoveredCell, setHoveredCell] = useState(null);
  const [windDirection, setWindDirection] = useState('North');
  const [baseWindSpeed, setBaseWindSpeed] = useState(10);
  // Instant UI readout for the slider; baseWindSpeed (above) drives the heavy recompute and is only
  // updated at most once per animation frame - see handleWindSpeedChange.
  const [displaySpeed, setDisplaySpeed] = useState(10);
  const pendingSpeedRef = useRef(10);
  const speedRafRef = useRef(null);

  // Fetch project data
  useEffect(() => {
    api.getProject(id).then(res => {
      setProject(res.data);
      setLoading(false);
    }).catch(() => {
      // Unknown project id (or unreachable API): show the 404 page instead of loading forever
      setNotFound(true);
      setLoading(false);
    });
  }, [id]);

  // Document title for this route, built from text this page itself renders (the project name)
  useEffect(() => {
    if (project) document.title = `GreenWind - ${project.name}`;
  }, [project]);

  // Cancel any pending throttled slider update on unmount
  useEffect(() => () => {
    if (speedRafRef.current != null) cancelAnimationFrame(speedRafRef.current);
  }, []);

  // Coordinate -> cell index for O(1) neighbor lookups, rebuilt only when the project data changes
  const cellIndex = useMemo(() => (project ? indexCellsByCoord(project.cells) : null), [project]);

  // Turbine-placement validity per cell, recomputed only when the layout actually changes (not on
  // hover, wind direction or wind speed changes)
  const validityMap = useMemo(() => {
    if (!project || !cellIndex) return [];
    return project.cells.map(cell => canPlaceTurbine(cell, cellIndex));
  }, [project, cellIndex]);

  // Simulation Data Calculation
  const simulationData = useMemo(() => {
    if (!project) return { cells: [], totalPower: 0, minPower: 0, maxPower: 0 };

    let totalPower = 0;
    let maxPower = 0;
    let minPower = Infinity;
    let hasTurbine = false;

    const calculatedCells = project.cells.map(cell => {
      const windData = calculateWindSpeed(cell, project.cells, baseWindSpeed, windDirection);
      let power = 0;

      if (cell.hasTurbine) {
        hasTurbine = true;
        power = calculatePower(windData.speed);
        totalPower += power;
        if (power > maxPower) maxPower = power;
        if (power < minPower) minPower = power;
      }

      return {
        ...cell,
        ...windData, // speed, modifier, reasons
        power
      };
    });

    if (!hasTurbine) minPower = 0;

    return { cells: calculatedCells, totalPower, minPower, maxPower };
  }, [project, windDirection, baseWindSpeed]);

  // Event Handlers
  const handleClearAllTurbines = async () => {
    if (!project) return;

    const hasTurbines = project.cells.some(cell => cell.hasTurbine);

    if (!hasTurbines) return;

    const updatedCells = project.cells.map(cell => ({ ...cell, hasTurbine: false }));
    const updatedProject = { ...project, cells: updatedCells };
    setProject(updatedProject);

    try {
      await api.updateProject(id, updatedProject);
    } catch (error) {
      console.error(error);
    }
  };

  // Handle cell click to toggle turbine - stable reference (useCallback) so MapCell's memoisation
  // isn't defeated by a freshly-created handler on every render
  const handleCellClick = useCallback(async (index) => {
    if (!project) return;

    const updatedCells = [...project.cells];
    const originalCell = updatedCells[index];

    if (!originalCell.hasTurbine && !canPlaceTurbine(originalCell, cellIndex)) return;

    let newHasTurbine = !originalCell.hasTurbine;
    updatedCells[index] = { ...originalCell, hasTurbine: newHasTurbine };
    const updatedProject = { ...project, cells: updatedCells };
    setProject(updatedProject);

    try {
      await api.updateProject(id, updatedProject);
    } catch (error) {
      console.error(error);
    }
  }, [project, cellIndex, id]);

  // Hover handlers - stable references, no dependencies, so a hover change only ever affects the
  // isHovered prop of the two cells involved instead of recreating a callback for all 400
  const handleCellHover = useCallback((index) => setHoveredCell(index), []);
  const handleCellLeave = useCallback(() => setHoveredCell(null), []);

  // Wind speed slider: update the displayed value instantly, but defer the O(400) simulation
  // recompute to at most once per animation frame so a fast drag can't queue up redundant work
  const handleWindSpeedChange = useCallback((e) => {
    const value = Number(e.target.value);
    setDisplaySpeed(value);
    pendingSpeedRef.current = value;
    if (speedRafRef.current == null) {
      speedRafRef.current = requestAnimationFrame(() => {
        speedRafRef.current = null;
        setBaseWindSpeed(pendingSpeedRef.current);
      });
    }
  }, []);

  // Project Cell Type Stats
  const stats = project ? {
      grass: project.cells.filter(c => c.type === 'Grass').length,
      lake: project.cells.filter(c => c.type === 'Lake').length,
      mountain: project.cells.filter(c => c.type === 'Mountain').length,
      turbines: project.cells.filter(c => c.hasTurbine).length
  } : {};

  // Loading State
  if (notFound)
    return <NotFound />;

  if (loading)
    return <div className="text-center p-10 text-xl text-stone-500">Loading...</div>;

  const arrowRotation = getArrowRotation(windDirection);

  // Main Render
  return (
    <div className="flex flex-col items-center gap-6 p-4 pb-20 w-full max-w-[1600px] mx-auto">
      {/* Top Section: Map + Info Panel */}
      <div className="flex flex-col xl:flex-row gap-8 w-full items-start">
        {/* Left side: Map Panel */}
        <div className="relative rounded-xl w-full xl:flex-1">
          <div className="relative rounded-xl overflow-hidden shadow-2xl border-4 border-stone-700 bg-stone-800 w-full xl:flex-1 aspect-square">
            <img
              src={project.mapData}
              className="absolute inset-0 w-full h-full object-fill z-0 opacity-90 select-none pointer-events-none"
              alt="Map"
              fetchpriority="high"
              decoding="async"
              onDragStart={(e) => e.preventDefault()}
            />

            <div className="absolute inset-0 z-10 grid grid-cols-20 grid-rows-20">
              {simulationData.cells.map((simCell, index) => {
                const cell = project.cells[index];

                return (
                  <MapCell
                    key={`${cell.x}-${cell.y}`}
                    cell={cell}
                    simCell={simCell}
                    isHovered={hoveredCell === index}
                    isValid={validityMap[index]}
                    arrowRotation={arrowRotation}
                    minPower={simulationData.minPower}
                    maxPower={simulationData.maxPower}
                    index={index}
                    turbineImg={turbineImg}
                    removeImg={removeImg}
                    onCellClick={handleCellClick}
                    onCellHover={handleCellHover}
                    onCellLeave={handleCellLeave}
                  />
                );
              })}
            </div>
          </div>
        </div>

        {/* Right side: Info Panel */}
        <div className="flex flex-col gap-6 w-full xl:w-[400px] shrink-0">
            <div className="bg-white p-6 rounded-2xl shadow-xl border border-stone-100">
                <h2 className="text-2xl font-extrabold text-stone-800 mb-6 border-b border-stone-100 pb-4">{project.name}</h2>
                <div className="space-y-6">
                    {/* Legend */}
                    <div className="p-4 bg-stone-50 rounded-xl border border-stone-200">
                        <h3 className="font-bold text-stone-600 mb-3 text-sm uppercase">Legend</h3>
                        <ul className="space-y-2 text-sm font-medium">
                            <li className="flex items-center gap-3"><div className="w-5 h-5 bg-emerald-400/40 border border-emerald-600 rounded shadow-xs"></div><span className="text-emerald-800">Grass (Buildable)</span></li>
                            <li className="flex items-center gap-3"><div className="w-5 h-5 bg-sky-400/40 border border-sky-600 rounded shadow-xs"></div><span className="text-sky-800">Lake (Forbidden)</span></li>
                            <li className="flex items-center gap-3"><div className="w-5 h-5 bg-amber-600/40 border border-amber-800 rounded shadow-xs"></div><span className="text-amber-800">Mountain (Forbidden)</span></li>
                        </ul>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-2 text-center">
                        <div className="bg-emerald-50 p-2 rounded-lg border border-emerald-100"><div className="text-lg font-bold text-emerald-700">{stats.grass}</div><div className="text-xs text-emerald-600">Grass</div></div>
                        <div className="bg-sky-50 p-2 rounded-lg border border-sky-100"><div className="text-lg font-bold text-sky-700">{stats.lake}</div><div className="text-xs text-sky-600">Lake</div></div>
                        <div className="bg-amber-50 p-2 rounded-lg border border-amber-100"><div className="text-lg font-bold text-amber-700">{stats.mountain}</div><div className="text-xs text-amber-600">Mountain</div></div>
                    </div>

                    {/* Turbines & Clear Button */}
                    <div className="mt-4 flex gap-3">
                      <div className="flex-[0.7] p-4 bg-emerald-600 rounded-xl text-white flex flex-col justify-center">
                          <span className="font-semibold text-sm opacity-90">Installed Turbines</span>
                          <span className="text-3xl font-extrabold">{stats.turbines} <span className="text-lg font-normal opacity-80">pcs</span></span>
                      </div>
                      <Button
                          onClick={handleClearAllTurbines}
                          disabled={stats.turbines === 0}
                          title={stats.turbines === 0 ? "No turbines to remove" : "Remove All Turbines"}
                          variant={stats.turbines === 0 ? 'dangerDisabled' : 'dangerEnabled'}
                      >
                          <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="select-none pointer-events-none" onDragStart={(e) => e.preventDefault()}>
                              <polyline points="3 6 5 6 21 6"></polyline>
                              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                              <line x1="10" y1="11" x2="10" y2="17"></line>
                              <line x1="14" y1="11" x2="14" y2="17"></line>
                          </svg>
                      </Button>
                  </div>
                </div>
            </div>
        </div>
      </div>

      {/* Bottom Section: Simulation Panel */}
      <div className="w-full bg-white p-8 rounded-2xl shadow-2xl border border-stone-200">
         <div className="flex flex-col lg:flex-row gap-8 items-center justify-between">

            {/* Wind Direction */}
            <div className="w-full flex-1">
                <h3 className="text-sm font-bold text-stone-400 uppercase tracking-wider mb-3">Wind Direction</h3>
                <div className="grid grid-cols-4 gap-2">
                    {Object.keys(WIND_DIRECTIONS).map(dir => (
                        <Button key={dir} onClick={() => setWindDirection(dir)} variant={windDirection === dir ? 'navActive' : 'navInactive'}>
                            <span className="text-lg mr-1 select-none pointer-events-none">{WIND_DIRECTIONS[dir].arrow}</span><br/>{dir}
                        </Button>
                    ))}
                </div>
            </div>

            {/* Wind Speed */}
            <div className="w-full flex-1 px-4">
                <div className="flex justify-between items-end mb-4">
                    <h3 className="text-sm font-bold text-stone-400 uppercase tracking-wider">Wind Speed</h3>
                    <span className="text-2xl font-mono font-bold text-stone-800">{displaySpeed} <span className="text-sm text-stone-400 font-sans">m/s</span></span>
                </div>
                <input type="range" min="0" max="40" step="1" value={displaySpeed} onChange={handleWindSpeedChange} className="w-full h-3 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"/>
                <div className="flex justify-between text-xs text-stone-400 mt-2 font-medium"><span>Calm (0 m/s)</span><span>Storm (40 m/s)</span></div>
            </div>

            {/* Output */}
            <div className="w-full md:w-auto min-w-[250px] flex-none">
                <div className="bg-stone-900 rounded-2xl p-6 text-center text-white shadow-xl relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 via-emerald-500 to-emerald-400"></div>
                    <h3 className="text-stone-400 text-xs font-bold uppercase tracking-widest mb-2">Total Power Output</h3>
                    <div className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 to-white">{(simulationData.totalPower / 1000).toFixed(2)} <span className="text-xl text-stone-500 font-medium">MW</span></div>
                    <div className="mt-2 text-sm text-stone-500 font-mono">{Math.round(simulationData.totalPower).toLocaleString()} kW generated</div>
                </div>
            </div>
         </div>
      </div>

    </div>
  );
};

export default MapEditor;
