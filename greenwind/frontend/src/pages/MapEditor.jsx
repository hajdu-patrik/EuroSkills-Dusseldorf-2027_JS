import { useEffect, useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../services/api';

import { calculateWindSpeed, calculatePower, WIND_DIRECTIONS } from '../utils/utils';

import turbineImg from '../assets/turbine.png';
import removeImg from '../assets/remove.png';

const MapEditor = () => {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hoveredCell, setHoveredCell] = useState(null);
  const [windDirection, setWindDirection] = useState('North');
  const [baseWindSpeed, setBaseWindSpeed] = useState(10);

  // Fetch project data
  useEffect(() => {
    api.getProject(id).then(res => {
      setProject(res.data);
      setLoading(false);
    });
  }, [id]);

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

  // Check neighboring cells for turbine presence
  const checkNeighbors = (targetX, targetY, cells) => {
    const directions = [[-1, -1], [0, -1], [1, -1], [-1, 0], [1, 0], [-1, 1], [0, 1], [1, 1]];
    for (let [dx, dy] of directions) {
      const neighbor = cells.find(c => c.x === targetX + dx && c.y === targetY + dy);
      if (neighbor?.hasTurbine) return true;
    }
    return false;
  };

  // Validate if a turbine can be placed
  const canPlaceTurbine = (cell, cells) => {
    if (cell.type !== 'Grass') return false;
    if (checkNeighbors(cell.x, cell.y, cells)) return false;
    return true;
  };

  // Handle cell click to toggle turbine
  const handleCellClick = async (index) => {
    if (!project) return;

    const updatedCells = [...project.cells];
    const originalCell = updatedCells[index];

    if (!originalCell.hasTurbine && !canPlaceTurbine(originalCell, project.cells)) return;

    let newHasTurbine = !originalCell.hasTurbine;
    updatedCells[index] = { ...originalCell, hasTurbine: newHasTurbine };
    const updatedProject = { ...project, cells: updatedCells };
    setProject(updatedProject);

    try {
      await api.updateProject(id, updatedProject);
    } catch (error) {
      console.error(error);
    }
  };

  // Helper to get turbine color class based on power
  const getTurbineColorClass = (power, min, max) => {
    if (min === max) return "bg-emerald-500/60";

    const ratio = (power - min) / (max - min || 1);

    if (ratio < 0.33) return "bg-red-500/60";
    if (ratio < 0.66) return "bg-orange-400/60";

    return "bg-emerald-500/60";
  };

  // Helper to get cell classes
  const getCellClasses = (cell, isHovered, simCell) => {
    let base = "relative flex items-center justify-center transition-all duration-150 border ";
    const isValid = canPlaceTurbine(cell, project.cells);
    const { minPower, maxPower } = simulationData;

    let bgClass = "";
    if (cell.hasTurbine) {
      bgClass = getTurbineColorClass(simCell.power, minPower, maxPower);
    } else if (cell.type === 'Lake') {
      bgClass = "hover:bg-sky-500/40";
    } else if (cell.type === 'Mountain') {
      bgClass = "hover:bg-stone-900/40";
    } else {
      bgClass = "bg-emerald-500/5 hover:bg-emerald-400/40";
    }

    if (isHovered && !cell.hasTurbine && !isValid) return `${base} border-red-500/50 bg-red-500/20 cursor-not-allowed`;
    if (cell.type === 'Lake' || cell.type === 'Mountain') return `${base} border-white/10 cursor-not-allowed ${bgClass}`;
    
    const hoverBorder = cell.hasTurbine 
        ? "border-transparent hover:bg-red-500/20" 
        : "border-white/10 hover:border-white/50";

    return `${base} cursor-pointer ${hoverBorder} ${bgClass}`;
  };

  // Helper to get arrow rotation based on wind direction
  const getArrowRotation = (dir) => {
    const rotationMap = { 'East': 180, 'West': 0, 'North': 90, 'South': -90 };
    return rotationMap[dir] || 0;
  };

  // Project Cell Type Stats
  const stats = project ? {
      grass: project.cells.filter(c => c.type === 'Grass').length,
      lake: project.cells.filter(c => c.type === 'Lake').length,
      mountain: project.cells.filter(c => c.type === 'Mountain').length,
      turbines: project.cells.filter(c => c.hasTurbine).length
  } : {};

  // Loading State
  if (loading)
    return <div className="text-center p-10 text-xl text-stone-500">Loading...</div>;

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
              onDragStart={(e) => e.preventDefault()} 
            />

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
                            <li className="flex items-center gap-3"><div className="w-5 h-5 bg-emerald-400/40 border border-emerald-600 rounded shadow-sm"></div><span className="text-emerald-800">Grass (Buildable)</span></li>
                            <li className="flex items-center gap-3"><div className="w-5 h-5 bg-sky-400/40 border border-sky-600 rounded shadow-sm"></div><span className="text-sky-800">Lake (Forbidden)</span></li>
                            <li className="flex items-center gap-3"><div className="w-5 h-5 bg-amber-600/40 border border-amber-800 rounded shadow-sm"></div><span className="text-amber-800">Mountain (Forbidden)</span></li>
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
                      <button 
                          onClick={handleClearAllTurbines}
                          disabled={stats.turbines === 0}
                          title={stats.turbines === 0 ? "No turbines to remove" : "Remove All Turbines"}
                          className={`flex-[0.3] rounded-xl flex items-center justify-center transition-colors duration-200 border ${stats.turbines === 0 ? "bg-stone-300 text-stone-500 cursor-not-allowed border-stone-300 shadow-none" : "bg-red-500 hover:bg-red-600 text-white border-red-400/20 shadow-red-200"}`}
                      >
                          <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="select-none pointer-events-none" onDragStart={(e) => e.preventDefault()}>
                              <polyline points="3 6 5 6 21 6"></polyline>
                              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                              <line x1="10" y1="11" x2="10" y2="17"></line>
                              <line x1="14" y1="11" x2="14" y2="17"></line>
                          </svg>
                      </button>
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
                        <button key={dir} onClick={() => setWindDirection(dir)} className={`py-3 px-2 rounded-xl text-sm font-bold border-2 transition-all ${windDirection === dir ? 'bg-stone-800 text-white border-stone-800 shadow-lg scale-105' : 'bg-white text-stone-600 border-stone-200 hover:border-stone-400 hover:bg-stone-50'}`}>
                            <span className="text-lg mr-1 select-none pointer-events-none">{WIND_DIRECTIONS[dir].arrow}</span><br/>{dir}
                        </button>
                    ))}
                </div>
            </div>

            {/* Wind Speed */}
            <div className="w-full flex-1 px-4">
                <div className="flex justify-between items-end mb-4">
                    <h3 className="text-sm font-bold text-stone-400 uppercase tracking-wider">Wind Speed</h3>
                    <span className="text-2xl font-mono font-bold text-stone-800">{baseWindSpeed} <span className="text-sm text-stone-400 font-sans">m/s</span></span>
                </div>
                <input type="range" min="0" max="40" step="1" value={baseWindSpeed} onChange={(e) => setBaseWindSpeed(Number(e.target.value))} className="w-full h-3 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"/>
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