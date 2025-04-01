
import React from 'react';
import { Football } from 'lucide-react';

const Header: React.FC = () => {
  return (
    <header className="bg-green-600 text-white shadow-md">
      <div className="container mx-auto px-4 py-6 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Football className="h-8 w-8" />
          <h1 className="text-xl md:text-2xl lg:text-3xl font-bold">Sportcalender</h1>
        </div>
        <p className="text-sm md:text-base hidden md:block">Download wedstrijdschema's naar je agenda</p>
      </div>
    </header>
  );
};

export default Header;
