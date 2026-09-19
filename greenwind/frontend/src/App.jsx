import { BrowserRouter, Routes, Route, useLocation, Link } from 'react-router-dom';
import ProjectList from './pages/ProjectList';
import MapEditor from './pages/MapEditor';
import NotFound from './pages/NotFound';
import Button from './components/ui/Button';
import logo from './assets/logo.png';

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
              width="128"
              height="128"
              fetchpriority="high"
              decoding="async"
              className="w-10 h-10 md:w-14 md:h-14 object-contain drop-shadow-xs transition-transform group-hover:scale-105"
            />
            <h1 className="sr-only">
              GreenWind
            </h1>
          </Link>

          {/* Back Button on Project Pages */}
          {showBackButton && (
            <Button as={Link} to="/" variant="ghost">
                ← <span className="hidden sm:inline">Back to Project List</span><span className="sm:hidden">Back</span>
            </Button>
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