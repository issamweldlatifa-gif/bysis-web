import { createContext, useContext, useState, useCallback, ReactNode } from 'react';

interface BgColorContextType {
  bgColor: string;
  setBgColor: (color: string) => void;
  /** Raw carousel color — used by header to match carousel */
  carouselColor: string;
  setCarouselColor: (color: string) => void;
}

const BgColorContext = createContext<BgColorContextType>({
  bgColor: '#ffffff',
  setBgColor: () => {},
  carouselColor: '#f5c518',
  setCarouselColor: () => {},
});

export function BgColorProvider({ children }: { children: ReactNode }) {
  const [bgColor, setBgColorState] = useState('#ffffff');
  const [carouselColor, setCarouselColorState] = useState('#f5c518');

  const setBgColor = useCallback((color: string) => {
    setBgColorState(color);
    document.documentElement.style.setProperty('--app-bg-color', color);
  }, []);

  const setCarouselColor = useCallback((color: string) => {
    setCarouselColorState(color);
    // Update meta theme-color for iOS status bar
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', color);
    document.documentElement.style.setProperty('--carousel-color', color);
  }, []);

  return (
    <BgColorContext.Provider value={{ bgColor, setBgColor, carouselColor, setCarouselColor }}>
      {children}
    </BgColorContext.Provider>
  );
}

export function useBgColor() {
  return useContext(BgColorContext);
}
