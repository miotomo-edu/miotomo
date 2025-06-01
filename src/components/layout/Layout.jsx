import React from "react";
// Removed the import for BottomNavBar as it will be rendered in App_new.jsx

const Layout = ({ children }) => {
  return (
    <div className="h-screen flex flex-col">
      <main className="flex-grow overflow-auto  min-h-screen pb-40">
        {children}
      </main>
    </div>
  );
};

export default Layout;
