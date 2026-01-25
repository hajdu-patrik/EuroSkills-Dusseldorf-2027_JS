import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';

const ProjectList = () => {
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    api.getProjects().then(res => setProjects(res.data))
       .catch(err => console.error("Server error:", err));
  }, []);

  const getStats = (cells) => {
    return {
      grass: cells.filter(c => c.type === 'Grass').length,
      lake: cells.filter(c => c.type === 'Lake').length,
      mountain: cells.filter(c => c.type === 'Mountain').length
    };
  };

  return (
    <div>
      <h2 className="text-3xl font-bold mb-8 text-stone-700 text-left">Available Projects</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {projects.map(p => {
          const stats = getStats(p.cells);
          
          return (
            <Link key={p.id} to={`/project/${p.id}`} className="group block h-full">
              <div className="bg-white border border-stone-200 rounded-2xl shadow-md hover:shadow-xl hover:border-emerald-500 transition-all duration-300 overflow-hidden flex flex-col h-full">
                
                {/* Image container */}
                <div className="h-56 overflow-hidden bg-stone-200 relative">
                  <img 
                    src={p.mapData} 
                    alt={p.name} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                    <h3 className="text-2xl font-bold text-white shadow-black drop-shadow-md">{p.name}</h3>
                  </div>
                </div>
                
                {/* Data segment */}
                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <p className="text-stone-500 text-sm mb-4 font-medium uppercase tracking-wide">Terrain Composition</p>
                    
                    <div className="space-y-3">
                      {/* Statistic bars */}
                      <div className="flex items-center justify-between text-sm">
                        <span className="flex items-center gap-2 text-emerald-700 font-bold">
                          <div className="w-3 h-3 rounded-full bg-emerald-500"></div> Grass
                        </span>
                        <span className="bg-emerald-50 text-emerald-700 px-2 py-1 rounded-md border border-emerald-100">
                          {stats.grass} pcs
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-sm">
                        <span className="flex items-center gap-2 text-sky-700 font-bold">
                          <div className="w-3 h-3 rounded-full bg-sky-500"></div> Lake
                        </span>
                        <span className="bg-sky-50 text-sky-700 px-2 py-1 rounded-md border border-sky-100">
                          {stats.lake} pcs
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-sm">
                        <span className="flex items-center gap-2 text-amber-700 font-bold">
                          <div className="w-3 h-3 rounded-full bg-amber-500"></div> Mountain
                        </span>
                        <span className="bg-amber-50 text-amber-700 px-2 py-1 rounded-md border border-amber-100">
                          {stats.mountain} pcs
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-6 pt-4 border-t border-stone-100 text-center">
                    <span className="text-xs text-stone-400 font-semibold">Total: {p.cells.length} Cells</span>
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