import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const NotFound = () => {
  const navigate = useNavigate();
  const [timeLeft, setTimeLeft] = useState(3);

  // Document title for this route, built from text this page itself renders
  useEffect(() => {
    document.title = 'GreenWind - Page Not Found';
  }, []);

  // Countdown and redirect effect
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    // Redirect after 3 seconds
    const redirectTimeout = setTimeout(() => {
      navigate('/');
    }, 3000);

    // Cleanup on unmount
    return () => {
      clearInterval(timer);
      clearTimeout(redirectTimeout);
    };
  }, [navigate]);

  // Main Render
  return (
    <div className="flex flex-col items-center justify-center text-center min-h-[60vh] px-4">
      <h2 className="text-6xl md:text-9xl font-black text-stone-200 mb-2 md:mb-4">
        404
      </h2>
      
      <h3 className="text-xl md:text-3xl font-bold text-stone-700 mb-6 md:mb-8">
        Page Not Found
      </h3>
      
      <div className="bg-white p-6 md:p-8 rounded-2xl shadow-xl border border-stone-100 w-[300px] sm:w-[350px] md:w-[400px] w-full">
        <p className="text-stone-500 mb-4 text-base md:text-lg">
          Redirecting to home page in:
        </p>
        
        <div className="text-5xl md:text-6xl font-mono font-bold text-emerald-600 animate-pulse">
          {timeLeft}
        </div>
        
        <p className="text-xs md:text-sm text-stone-400 mt-2">seconds</p>
      </div>
    </div>
  );
};

export default NotFound;