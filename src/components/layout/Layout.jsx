import React from "react";
// Removed the import for BottomNavBar as it will be rendered in App_new.jsx

const Layout = ({ children }) => {
  return (
    <div className="h-screen flex flex-col">
      <main className="flex-grow overflow-auto  min-h-screen pb-40">
        {/* children will now include the active component AND the BottomNavBar from App_new.jsx */}
        {children}
      </main>
      {/* Removed BottomNavBar from here */}
    </div>
  );
};

export default Layout;
