
import React from 'react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-800 text-white py-6 mt-12">
      <div className="container mx-auto px-4 text-center">
        <p>© {new Date().getFullYear()} Voetbal Agenda Sync. Alle rechten voorbehouden.</p>
        <p className="text-sm mt-2">
          Wij zijn niet geaffilieerd met enige voetbalclub, competitie of organisatie. 
          Alle logo's en merken zijn eigendom van hun respectievelijke eigenaren.
        </p>
        <div className="mt-4">
          <Link 
            to="/api-check" 
            className="text-green-300 hover:text-green-400 hover:underline text-sm"
          >
            API Status Controleren
          </Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
