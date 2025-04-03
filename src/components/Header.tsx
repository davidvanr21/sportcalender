
import React from 'react';
import { Goal } from 'lucide-react';
import { motion } from 'framer-motion';

const Header: React.FC = () => {
  return (
    <header className="bg-gradient-to-r from-green-700 via-green-600 to-green-500 text-white shadow-md">
      <div className="container mx-auto px-4 py-6 flex items-center justify-between">
        <motion.div 
          className="flex items-center space-x-2"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Goal className="h-8 w-8" />
          <h1 className="text-xl md:text-2xl lg:text-3xl font-bold">Sportcalender</h1>
        </motion.div>
        <motion.p 
          className="text-sm md:text-base hidden md:block"
          animate={{ 
            x: [0, 10, 0],
          }}
          transition={{ 
            repeat: Infinity,
            duration: 3,
            ease: "easeInOut" 
          }}
        >
          Download wedstrijdschema's naar je agenda
        </motion.p>
      </div>
    </header>
  );
};

export default Header;
