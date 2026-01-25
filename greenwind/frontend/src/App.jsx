import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ProjectList from './pages/ProjectList';
import MapEditor from './pages/MapEditor';

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-stone-100 font-sans text-stone-800">
        <div className="p-6 max-w-7xl mx-auto">
          <nav className="mb-10 border-b border-stone-300 pb-6 flex justify-center">
            <h1 className="text-4xl font-extrabold text-emerald-800 flex items-center gap-3 tracking-tight">
              <span>🍃</span> GreenWind <span>🍃</span>
            </h1>
          </nav>
          
          <Routes>
            <Route path="/" element={<ProjectList />} />
            <Route path="/project/:id" element={<MapEditor />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;