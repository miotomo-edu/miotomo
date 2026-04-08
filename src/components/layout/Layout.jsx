// buildathon/miot/src/components/layout/Layout.jsx
import React from "react";

const Layout = ({
  children,
  mainRef,
  disableScroll = false,
  screenshotMode = false,
  withBottomNav = true,
  fullHeight = false,
  mainClassName = "",
}) => {
  const containerClassName = screenshotMode
    ? "flex min-h-screen flex-col"
    : "flex flex-col flex-1 h-full min-h-0";
  const scrollBehaviorClassName = screenshotMode
    ? "overflow-visible touch-auto"
    : disableScroll
      ? "overflow-hidden touch-none"
      : "overflow-y-auto touch-pan-y";
  const bottomNavClassName =
    withBottomNav && !screenshotMode ? "with-bottom-nav" : "";
  const fullHeightClassName =
    fullHeight && !screenshotMode ? "flex h-full flex-col" : "";

  return (
    <div className={containerClassName}>
      <main
        ref={mainRef}
        className={`scroll-container safe-area-top ${bottomNavClassName} ${fullHeightClassName} ${screenshotMode ? "min-h-screen" : "flex-1 min-h-0"} ${scrollBehaviorClassName} ${mainClassName}`}
      >
        {children}
      </main>
    </div>
  );
};

export default Layout;
