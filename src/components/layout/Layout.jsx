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
  const containerClassName = "flex min-h-screen flex-col";
  const scrollBehaviorClassName = disableScroll
    ? "h-screen overflow-hidden touch-none"
    : "overflow-visible touch-auto";
  const bottomNavClassName =
    withBottomNav && !screenshotMode ? "with-bottom-nav" : "";
  const fullHeightClassName =
    fullHeight && !disableScroll ? "flex min-h-screen flex-col" : "";

  return (
    <div className={containerClassName}>
      <main
        ref={mainRef}
        className={`scroll-container safe-area-top ${bottomNavClassName} ${fullHeightClassName} ${disableScroll ? "" : "min-h-screen"} ${scrollBehaviorClassName} ${mainClassName}`}
      >
        {children}
      </main>
    </div>
  );
};

export default Layout;
