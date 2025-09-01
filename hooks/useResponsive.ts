import { useState, useEffect } from "react";
import { BREAKPOINTS } from "@/lib/constants/breakpoints";

export type ScreenSize = "mobile" | "tablet" | "desktop";

export const useResponsive = () => {
  const [screenSize, setScreenSize] = useState<ScreenSize>("desktop");
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [isDesktop, setIsDesktop] = useState(true);

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;

      if (width <= BREAKPOINTS.mobile) {
        setScreenSize("mobile");
        setIsMobile(true);
        setIsTablet(false);
        setIsDesktop(false);
      } else if (width <= BREAKPOINTS.tablet) {
        setScreenSize("tablet");
        setIsMobile(false);
        setIsTablet(true);
        setIsDesktop(false);
      } else {
        setScreenSize("desktop");
        setIsMobile(false);
        setIsTablet(false);
        setIsDesktop(true);
      }
    };

    // 초기 설정
    handleResize();

    // 리사이즈 이벤트 리스너
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return {
    screenSize,
    isMobile,
    isTablet,
    isDesktop,
  };
};
