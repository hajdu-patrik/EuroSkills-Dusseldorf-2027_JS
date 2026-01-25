import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../services/api';

import turbineImg from '../assets/Turbine.png';
import removeImg from '../assets/Exclusion.png';

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

  const handleCellClick = async (index) => {
    if (!project) return;
    const updatedCells = [...project.cells];
    const cell = updatedCells[index];

    if (cell.type !== 'Grass') {
      alert("Only grass terrain can have turbines! 🌱");
      return;
    }

    if (cell.hasTurbine) {
      cell.hasTurbine = false;
    } else {
      if (checkNeighbors(cell.x, cell.y, updatedCells)) {
        alert("Too close to another turbine! ⚠️");
        return;
      }
      cell.hasTurbine = true;
    }

    const updatedProject = { ...project, cells: updatedCells };
    setProject(updatedProject);
    try {
      await api.updateProject(id, updatedProject);
    }
    catch (error) {
      alert("Error saving!");
    }
  };

  const getCellClasses = (type, hasTurbine) => {
    let base = "relative flex items-center justify-center transition-all duration-150 ";
    
    if (type === 'Lake')
      return base + "border border-white/10 hover:bg-sky-500/40 cursor-not-allowed";

    if (type === 'Mountain')
      return base + "border border-white/10 hover:bg-stone-900/40 cursor-not-allowed";
    
    if (hasTurbine)
        return base + "border-none bg-emerald-500/10 hover:bg-red-500/20 cursor-pointer";

    return base + "border border-white/10 hover:bg-emerald-400/40 cursor-pointer hover:border-white/50";
  };

  // Statistics calculator
  const stats = project ? {
      grass: project.cells.filter(c => c.type === 'Grass').length,
      lake: project.cells.filter(c => c.type === 'Lake').length,
      mountain: project.cells.filter(c => c.type === 'Mountain').length,
      turbines: project.cells.filter(c => c.hasTurbine).length
  } : {};

  if (loading)
    return <div className="text-center p-10 text-xl text-stone-500">Loading...</div>;

  return (
    <div>
      <div className="flex flex-col lg:flex-row gap-10 items-start justify-center">
        
        {/* Left side: Map */}
        <div className="relative rounded-xl overflow-hidden shadow-2xl border-4 border-stone-700 bg-stone-800">
          <div className="w-[600px] h-[600px] relative">
            <img src={project.mapData} className="absolute inset-0 w-full h-full object-fill z-0 opacity-90" alt="Map" />
            
            <div className="absolute inset-0 z-10 grid grid-cols-20 grid-rows-20">
              {project.cells.map((cell, index) => {
                const isHovered = hoveredCell === index;
                return (
                  <div 
                    key={`${cell.x}-${cell.y}`}
                    className={getCellClasses(cell.type, cell.hasTurbine)}
                    onClick={() => handleCellClick(index)}
                    onMouseEnter={() => setHoveredCell(index)}
                    onMouseLeave={() => setHoveredCell(null)}
                    title={`X:${cell.x}, Y:${cell.y} (${cell.type})`}
                  >
                    {cell.hasTurbine && (
                      <img 
                        src={isHovered ? removeImg : turbineImg} 
                        alt="icon" 
                        className={`w-4/5 h-4/5 object-contain drop-shadow-lg pointer-events-none transform-gpu will-change-transform ${!isHovered ? 'animate-spin-slow' : ''}`} 
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right side: Info Panel */}
        <div className="flex flex-col gap-6 w-full max-w-sm">
            <div className="bg-white p-6 rounded-2xl shadow-xl border border-stone-100">
                <h2 className="text-2xl font-extrabold text-stone-800 mb-6 border-b border-stone-100 pb-4">{project.name}</h2>
                
                <div className="space-y-6">
                    {/* Legend */}
                    <div className="p-4 bg-stone-50 rounded-xl border border-stone-200">
                        <h3 className="font-bold text-stone-600 mb-3 text-sm uppercase">Legend</h3>
                        <ul className="space-y-2 text-sm font-medium">
                            <li className="flex items-center gap-3">
                                <div className="w-5 h-5 bg-emerald-400/40 border border-emerald-600 rounded shadow-sm"></div>
                                <span className="text-emerald-800">Grass (Buildable)</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <div className="w-5 h-5 bg-sky-400/40 border border-sky-600 rounded shadow-sm"></div>
                                <span className="text-sky-800">Lake (Forbidden)</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <div className="w-5 h-5 bg-amber-600/40 border border-amber-800 rounded shadow-sm"></div>
                                <span className="text-amber-800">Mountain (Forbidden)</span>
                            </li>
                        </ul>
                    </div>

                    {/* Statistics Grid */}
                    <div className="grid grid-cols-3 gap-2 text-center">
                        <div className="bg-emerald-50 p-2 rounded-lg border border-emerald-100">
                            <div className="text-lg font-bold text-emerald-700">{stats.grass}</div>
                            <div className="text-xs text-emerald-600">Grass</div>
                        </div>
                        <div className="bg-sky-50 p-2 rounded-lg border border-sky-100">
                            <div className="text-lg font-bold text-sky-700">{stats.lake}</div>
                            <div className="text-xs text-sky-600">Lake</div>
                        </div>
                        <div className="bg-amber-50 p-2 rounded-lg border border-amber-100">
                            <div className="text-lg font-bold text-amber-700">{stats.mountain}</div>
                            <div className="text-xs text-amber-600">Mntn</div>
                        </div>
                    </div>

                    {/* Turbines */}
                    <div className="p-5 bg-emerald-600 rounded-xl text-white flex justify-between items-center">
                        <span className="font-semibold">Installed Turbines</span>
                        <span className="text-3xl font-extrabold">
                            {stats.turbines} <span className="text-lg font-normal opacity-80">pcs</span>
                        </span>
                    </div>
                </div>
            </div>

            {/* Back Button */}
            <Link to="/" className="w-full text-center py-3 bg-white text-stone-600 font-bold rounded-xl border-2 border-stone-200 hover:bg-stone-100 hover:border-stone-300 hover:text-stone-800 transition-all shadow-sm">
                ← Back to Project List
            </Link>
        </div>

      </div>
    </div>
  );
};

export default MapEditor;