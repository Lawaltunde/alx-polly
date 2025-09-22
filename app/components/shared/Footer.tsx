import React from 'react';

const Footer = () => {
  return (
    <footer className="w-full bg-card py-4 border-t border-border">
      <div className="container mx-auto text-center text-sm text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} Lawal Hammed. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;