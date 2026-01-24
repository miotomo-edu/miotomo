// buildathon/miot/src/components/layout/Layout.jsx
import React from "react";

const Layout = ({
  children,
  mainRef,
  disableScroll = false,
  withBottomNav = true,
  fullHeight = false,
}) => {
  return (
    <div className="flex flex-col flex-1 h-full min-h-0">
      <main
        ref={mainRef}
        className={`scroll-container ${withBottomNav ? "with-bottom-nav" : ""} ${fullHeight ? "flex h-full flex-col" : ""} flex-1 min-h-0 ${disableScroll ? "overflow-hidden touch-none" : "overflow-y-auto touch-pan-y"}`}
      >
        {children}
      </main>
    </div>
  );
};

export default Layout;
