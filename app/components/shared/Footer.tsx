import React from 'react';

const Footer = () => {
  return (
    <footer className="w-full bg-gray-100 py-4 dark:bg-gray-800">
      <div className="container mx-auto text-center text-sm text-gray-500 dark:text-gray-400">
        <p>&copy; {new Date().getFullYear()} Lawal Hammed. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;