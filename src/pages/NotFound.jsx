import { Link } from 'react-router-dom';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="text-center">
        <div className="w-20 h-20 bg-[--color-acm-light] rounded-full flex items-center justify-center mx-auto mb-6 text-[--color-acm-blue]">
          <ShieldAlert size={40} />
        </div>
        <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-gray-700 mb-2">Page Not Found</h2>
        <p className="text-gray-500 mb-8 max-w-md mx-auto">
          The admin page you're looking for doesn't exist or you don't have access to it.
        </p>
        <Link 
          to="/"
          className="inline-flex items-center justify-center gap-2 bg-[--color-acm-blue] text-white py-3 px-6 rounded-lg font-medium hover:bg-[--color-acm-dark] transition-colors"
        >
          <ArrowLeft size={18} />
          Return to Dashboard
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
