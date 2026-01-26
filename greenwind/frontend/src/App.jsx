import { BrowserRouter, Routes, Route, useLocation, Link } from 'react-router-dom';
import ProjectList from './pages/ProjectList';
import MapEditor from './pages/MapEditor';
import NotFound from './pages/NotFound';
import logo from './assets/favicon.ico';

const AppContent = () => {
  const location = useLocation();
  const showBackButton = location.pathname.startsWith('/project/');

  return (
    <div className="min-h-screen bg-stone-100 font-sans text-stone-800">
      <div className="p-4 md:p-6 w-full max-w-[1600px] mx-auto">
        <nav className="mb-6 md:mb-10 border-b border-stone-300 pb-4 md:pb-6 flex justify-between items-center">
          
          {/* Logo and Home Link */}
          <Link to="/" className="flex items-center gap-3 group hover:opacity-80 transition-opacity">
            <img 
              src={logo} 
              alt="GreenWind Logo" 
              className="w-10 h-10 md:w-14 md:h-14 object-contain drop-shadow-sm transition-transform group-hover:scale-105" 
            />
            <h1 className="sr-only">
              GreenWind
            </h1>
          </Link>

          {/* Back Button on Project Pages */}
          {showBackButton && (
            <Link to="/" className="inline-block px-4 py-2 md:px-6 md:py-3 bg-white text-stone-600 font-bold text-xs md:text-base rounded-xl border-2 border-stone-200 hover:bg-stone-100 hover:border-stone-300 hover:text-stone-800 transition-all shadow-sm">
                ← <span className="hidden sm:inline">Back to Project List</span><span className="sm:hidden">Back</span>
            </Link>
          )}
        </nav>
        
        <Routes>
          <Route path="/" element={<ProjectList />} />
          <Route path="/project/:id" element={<MapEditor />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    </div>
  );
};

function App() {
  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;