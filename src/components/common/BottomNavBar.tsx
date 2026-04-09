import React, { useEffect, useRef, useState } from "react";
import { CirclesIcon } from "./icons/CirclesIcon";
import { TomoIcon } from "./icons/TomoIcon4";
import { ProgressIcon } from "./icons/ProgressIcon";

interface BottomNavBarProps {
  items?: { label: string; componentName: string; icon?: React.ReactNode }[];
  onItemClick?: (componentName: string) => void;
  onBackClick?: () => void;
  scrollContainerRef?: React.RefObject<HTMLElement>;
  activeComponentName?: string;
  className?: string;
  style?: React.CSSProperties;
  orientation?: "horizontal" | "vertical";
  mode?: "navigation" | "back";
}

const defaultNavItems = [
  { label: "Circles", componentName: "library", icon: <CirclesIcon /> },
  { label: "Tomo", componentName: "parents", icon: <TomoIcon /> },
  { label: "Growth", componentName: "progress", icon: <ProgressIcon /> },
];

const BottomNavBar: React.FC<BottomNavBarProps> = ({
  items = defaultNavItems,
  onItemClick = () => {},
  onBackClick,
  scrollContainerRef,
  activeComponentName = "library",
  className = "",
  style,
  orientation = "horizontal",
  mode = "navigation",
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isCompactExpanded, setIsCompactExpanded] = useState(false);
  const navRef = useRef<HTMLElement | null>(null);
  const expandedScrollTopRef = useRef(0);

  useEffect(() => {
    if (orientation !== "vertical" || !isExpanded || mode === "back") {
      return undefined;
    }

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target;
      if (!(target instanceof Node)) return;
      if (navRef.current?.contains(target)) return;
      setIsExpanded(false);
    };

    document.addEventListener("pointerdown", handlePointerDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
    };
  }, [isExpanded, orientation]);

  useEffect(() => {
    if (orientation !== "vertical" || !isExpanded || mode === "back") {
      setIsCompactExpanded(false);
      return;
    }

    const getScrollTop = () => {
      const refElement = scrollContainerRef?.current;
      const scrollElement =
        refElement instanceof HTMLElement &&
        refElement.scrollHeight - refElement.clientHeight > 8
          ? refElement
          : document.scrollingElement ?? document.documentElement;

      if (scrollElement instanceof HTMLElement) {
        return scrollElement.scrollTop;
      }

      return window.scrollY || 0;
    };

    expandedScrollTopRef.current = getScrollTop();
    setIsCompactExpanded(false);

    let frameId = 0;
    const handleScroll = () => {
      window.cancelAnimationFrame(frameId);
      frameId = window.requestAnimationFrame(() => {
        const nextScrollTop = getScrollTop();
        setIsCompactExpanded(
          Math.abs(nextScrollTop - expandedScrollTopRef.current) > 24,
        );
      });
    };

    document.addEventListener("scroll", handleScroll, {
      capture: true,
      passive: true,
    });
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll);

    return () => {
      window.cancelAnimationFrame(frameId);
      document.removeEventListener("scroll", handleScroll, true);
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, [isExpanded, mode, orientation, scrollContainerRef]);

  const handleButtonClick = (componentName: string) => {
    if (typeof onItemClick === "function") {
      onItemClick(componentName);
    }
    if (orientation === "vertical") {
      setIsExpanded(false);
    }
  };

  const isBackMode = mode === "back";
  const activeItem =
    items.find((item) => item.componentName === activeComponentName) ?? items[0];
  const activeIndex = Math.max(
    items.findIndex((item) => item.componentName === activeItem?.componentName),
    0,
  );
  const itemsBeforeActive = items.slice(0, activeIndex);
  const itemsAfterActive = items.slice(activeIndex + 1);
  const triggerIcon = activeItem?.icon ? (
    React.cloneElement(activeItem.icon as React.ReactElement, {
      className: "h-6 w-6",
      strokeWidth: 2.5,
    })
  ) : null;
  const backIcon = (
    <svg viewBox="0 0 20 20" className="h-5 w-5" fill="none" aria-hidden="true">
      <path
        d="M12.5 4.5L7 10l5.5 5.5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );

  const baseStyle: React.CSSProperties = {
    backgroundColor:
      orientation === "vertical" ? "rgba(30, 30, 30, 0.58)" : "#000000",
    backdropFilter: orientation === "vertical" ? "blur(24px) saturate(1.15)" : undefined,
    WebkitBackdropFilter:
      orientation === "vertical" ? "blur(24px) saturate(1.15)" : undefined,
    ...style,
  };

  const navClassName =
    orientation === "vertical"
      ? `fixed left-4 top-4 z-[90] flex flex-col items-center rounded-[999px] border border-white/10 shadow-[0_18px_40px_rgba(0,0,0,0.26)] transition-[width,padding,background-color] duration-200 md:left-6 md:top-6 ${isExpanded ? isCompactExpanded ? "w-[54px] gap-0.5 px-1 py-1.5" : "w-[76px] gap-1 px-1.5 py-2" : "w-[50px] p-1"}`
      : "bottom-navbar-fixed flex justify-around items-center h-16 z-10";

  return (
    <nav
      ref={navRef}
      className={`${navClassName} ${className}`}
      style={baseStyle}
    >
      {orientation === "vertical" ? (
        <>
          {isBackMode ? (
            <button
              type="button"
              onClick={onBackClick}
              className="flex aspect-square w-full cursor-pointer items-center justify-center rounded-full px-0.5 py-1 transition duration-200 hover:bg-white/[0.08]"
              aria-label="Go back"
            >
              <span
                className="flex items-center justify-center text-white transition-colors duration-150"
              >
                {backIcon}
              </span>
            </button>
          ) : (
            <>
          {isExpanded
            ? itemsBeforeActive.map((item, index) => {
                const isActive = activeComponentName === item.componentName;
                const icon = item.icon ? (
                  React.cloneElement(item.icon as React.ReactElement, {
                    className: "w-6 h-6",
                    strokeWidth: isActive ? 2.5 : 1.5,
                  })
                ) : (
                  <UserIcon className="w-6 h-6" />
                );
                return (
                  <button
                    key={`${item.componentName}-before-${index}`}
                    onClick={() => handleButtonClick(item.componentName)}
                    className={`group flex w-full cursor-pointer flex-col items-center justify-center rounded-[18px] transition duration-200 hover:bg-white/[0.08] ${isCompactExpanded ? "px-1 py-1.5" : "px-1.5 py-2"}`}
                    type="button"
                    aria-current={isActive ? "page" : undefined}
                  >
                    <span
                      className="flex items-center justify-center transition-colors duration-150"
                      style={{
                        color: isActive ? "#FAC304" : "rgba(255,255,255,0.55)",
                      }}
                    >
                      {icon}
                    </span>
                    <span
                      className={`text-[10px] font-semibold uppercase tracking-[0.18em] transition-all duration-150 ${isCompactExpanded ? "max-h-0 overflow-hidden opacity-0" : "max-h-4 opacity-100"}`}
                      style={{
                        color: isActive ? "#FAC304" : "rgba(255,255,255,0.55)",
                        fontWeight: isActive ? 700 : 400,
                      }}
                    >
                      {item.label}
                    </span>
                    <span
                      className={`block rounded-full transition-all duration-150 ${isCompactExpanded ? "mt-0.5 h-0.5 w-4" : "mt-1 h-1 w-5"}`}
                      style={{
                        backgroundColor: isActive ? "#FAC304" : "transparent",
                      }}
                      aria-hidden="true"
                    />
                  </button>
                );
              })
            : null}
          <button
            type="button"
            onClick={() =>
              setIsExpanded((current) => {
                if (!current) {
                  setIsCompactExpanded(false);
                }
                return !current;
              })
            }
            className={`flex w-full cursor-pointer flex-col items-center justify-center transition duration-200 hover:bg-white/[0.08] ${isExpanded ? isCompactExpanded ? "rounded-[18px] px-1 py-1.5" : "rounded-[18px] px-1.5 py-2" : "aspect-square rounded-full px-0.5 py-1"}`}
            aria-expanded={isExpanded}
            aria-label={isExpanded ? "Collapse navigation" : "Expand navigation"}
          >
            <span
              className="flex items-center justify-center transition-colors duration-150"
              style={{ color: "#FAC304" }}
            >
              {triggerIcon}
            </span>
            {isExpanded ? (
              <>
                <span
                  className={`text-[10px] font-semibold uppercase tracking-[0.18em] text-[#FAC304] transition-all duration-150 ${isCompactExpanded ? "max-h-0 overflow-hidden opacity-0" : "mt-1 max-h-4 opacity-100"}`}
                >
                  {activeItem?.label ?? "Menu"}
                </span>
                <span
                  className={`block rounded-full bg-[#FAC304] transition-all duration-150 ${isCompactExpanded ? "mt-0.5 h-0.5 w-4" : "mt-1 h-1 w-5"}`}
                  aria-hidden="true"
                />
              </>
            ) : null}
          </button>
          {isExpanded
            ? itemsAfterActive.map((item, index) => {
                const isActive = activeComponentName === item.componentName;
                const icon = item.icon ? (
                  React.cloneElement(item.icon as React.ReactElement, {
                    className: "w-6 h-6",
                    strokeWidth: isActive ? 2.5 : 1.5,
                  })
                ) : (
                  <UserIcon className="w-6 h-6" />
                );
                return (
                  <button
                    key={`${item.componentName}-after-${index}`}
                    onClick={() => handleButtonClick(item.componentName)}
                    className={`group flex w-full cursor-pointer flex-col items-center justify-center rounded-[18px] transition duration-200 hover:bg-white/[0.08] ${isCompactExpanded ? "px-1 py-1.5" : "px-1.5 py-2"}`}
                    type="button"
                    aria-current={isActive ? "page" : undefined}
                  >
                    <span
                      className="flex items-center justify-center transition-colors duration-150"
                      style={{
                        color: isActive ? "#FAC304" : "rgba(255,255,255,0.55)",
                      }}
                    >
                      {icon}
                    </span>
                    <span
                      className={`text-[10px] font-semibold uppercase tracking-[0.18em] transition-all duration-150 ${isCompactExpanded ? "max-h-0 overflow-hidden opacity-0" : "max-h-4 opacity-100"}`}
                      style={{
                        color: isActive ? "#FAC304" : "rgba(255,255,255,0.55)",
                        fontWeight: isActive ? 700 : 400,
                      }}
                    >
                      {item.label}
                    </span>
                    <span
                      className={`block rounded-full transition-all duration-150 ${isCompactExpanded ? "mt-0.5 h-0.5 w-4" : "mt-1 h-1 w-5"}`}
                      style={{
                        backgroundColor: isActive ? "#FAC304" : "transparent",
                      }}
                      aria-hidden="true"
                    />
                  </button>
                );
              })
            : null}
            </>
          )}
        </>
      ) : (
        items.map((item, index) => {
        const isActive = activeComponentName === item.componentName;
        // Ensure icon is always sized the same
        const icon = item.icon ? (
          React.cloneElement(item.icon as React.ReactElement, {
            className: "w-6 h-6",
            strokeWidth: isActive ? 2.5 : 1.5,
          })
        ) : (
          <UserIcon className="w-6 h-6" />
        );
        return (
          <button
            key={index}
            onClick={() => handleButtonClick(item.componentName)}
            className={`group flex cursor-pointer flex-col items-center justify-center rounded-[22px] transition duration-200 ${orientation === "vertical" ? "w-full gap-1 px-2 py-3 hover:bg-white/[0.08]" : "p-2"}`}
            type="button"
            aria-current={isActive ? "page" : undefined}
          >
            <span
              className={`flex items-center justify-center transition-colors duration-150 ${orientation === "vertical" ? "" : "mb-1"}`}
              style={{
                color: isActive ? "#FAC304" : "rgba(255,255,255,0.55)",
              }}
            >
              {icon}
            </span>
            <span
              className={`transition-colors duration-150 ${orientation === "vertical" ? "text-[10px] font-semibold uppercase tracking-[0.18em]" : "text-xs"}`}
              style={{
                color: isActive ? "#FAC304" : "rgba(255,255,255,0.55)",
                fontWeight: isActive ? 700 : 400,
              }}
            >
              {item.label}
            </span>
            <span
              className={`block rounded-full transition-all duration-150 ${orientation === "vertical" ? "mt-1 h-1 w-5" : "mt-1 h-1 w-1"}`}
              style={{
                backgroundColor: isActive ? "#FAC304" : "transparent",
              }}
              aria-hidden="true"
            />
          </button>
        );
        })
      )}
    </nav>
  );
};

export default BottomNavBar;
