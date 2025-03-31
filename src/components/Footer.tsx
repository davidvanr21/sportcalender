
import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-100 text-gray-600 py-6 mt-12">
      <div className="container mx-auto px-4 text-center">
        <p>© {new Date().getFullYear()} Voetbal Agenda Sync. Alle rechten voorbehouden.</p>
        <p className="text-sm mt-2">
          Wij zijn niet geaffilieerd met enige voetbalclub, competitie of organisatie. 
          Alle logo's en merken zijn eigendom van hun respectievelijke eigenaren.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
