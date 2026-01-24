// buildathon/miot/src/components/layout/Layout.jsx
import React from "react";

const Layout = ({ children, mainRef, disableScroll = false }) => {
  return (
    <div className="flex flex-col flex-1 h-full min-h-0">
      <main
        ref={mainRef}
        className={`with-bottom-nav flex-1 min-h-0 ${disableScroll ? "overflow-hidden" : "overflow-y-auto"}`}
      >
        {children}
      </main>
    </div>
  );
};

export default Layout;
