import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';

const ProjectList = () => {
  const [projects, setProjects] = useState([]);

  // Fetch projects on component mount
  useEffect(() => {
    api.getProjects().then(res => setProjects(res.data))
       .catch(err => console.error("Server error:", err));
  }, []);

  // Function to calculate terrain statistics
  const getStats = (cells) => {
    return {
      grass: cells.filter(c => c.type === 'Grass').length,
      lake: cells.filter(c => c.type === 'Lake').length,
      mountain: cells.filter(c => c.type === 'Mountain').length
    };
  };

  // Main Render
  return (
    <div className="w-full max-w-[1600px] mx-auto pb-10">
      <h2 className="text-2xl md:text-3xl font-bold mb-6 md:mb-8 text-stone-700 text-center md:text-left">
        Available Projects
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
        {projects.map(p => {
          const stats = getStats(p.cells);
          
          return (
            <Link key={p.id} to={`/project/${p.id}`} className="group block h-full">
              <div className="bg-white border border-stone-200 rounded-2xl shadow-md hover:shadow-xl hover:border-emerald-500 transition-all duration-300 overflow-hidden flex flex-col h-full transform hover:-translate-y-1">
                
                <div className="h-48 md:h-56 overflow-hidden bg-stone-200 relative">
                  <img 
                    src={p.mapData} 
                    alt={p.name} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 select-none"
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                    <h3 className="text-xl md:text-2xl font-bold text-white shadow-black drop-shadow-md truncate">{p.name}</h3>
                  </div>
                </div>
                
                <div className="p-5 md:p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <p className="text-stone-500 text-xs md:text-sm mb-4 font-medium uppercase tracking-wide">Terrain Composition</p>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="flex items-center gap-2 text-emerald-700 font-bold">
                          <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-xs"></div> Grass
                        </span>
                        <span className="bg-emerald-50 text-emerald-700 px-2 py-1 rounded-md border border-emerald-100 text-xs font-bold">
                          {stats.grass}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-sm">
                        <span className="flex items-center gap-2 text-sky-700 font-bold">
                          <div className="w-3 h-3 rounded-full bg-sky-500 shadow-xs"></div> Lake
                        </span>
                        <span className="bg-sky-50 text-sky-700 px-2 py-1 rounded-md border border-sky-100 text-xs font-bold">
                          {stats.lake}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-sm">
                        <span className="flex items-center gap-2 text-amber-700 font-bold">
                          <div className="w-3 h-3 rounded-full bg-amber-500 shadow-xs"></div> Mountain
                        </span>
                        <span className="bg-amber-50 text-amber-700 px-2 py-1 rounded-md border border-amber-100 text-xs font-bold">
                          {stats.mountain}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-6 pt-4 border-t border-stone-100 text-center">
                    <span className="text-xs text-stone-400 font-semibold tracking-wider">TOTAL: {p.cells.length} CELLS</span>
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default ProjectList;