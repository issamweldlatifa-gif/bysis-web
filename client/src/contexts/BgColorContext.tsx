import { createContext, useContext, useState, ReactNode } from 'react';

interface BgColorContextType {
  bgColor: string;
  setBgColor: (color: string) => void;
}

const BgColorContext = createContext<BgColorContextType>({
  bgColor: '#cadfe2',
  setBgColor: () => {},
});

export function BgColorProvider({ children }: { children: ReactNode }) {
  const [bgColor, setBgColor] = useState('#cadfe2');

  // Update meta theme-color AND html CSS variable dynamically
  const setColorAndMeta = (color: string) => {
    setBgColor(color);
    // Update meta theme-color for iOS status bar in Safari
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', color);
    // Update CSS variable on html element so background extends into safe-area
    document.documentElement.style.setProperty('--app-bg-color', color);
  };

  return (
    <BgColorContext.Provider value={{ bgColor, setBgColor: setColorAndMeta }}>
      {children}
    </BgColorContext.Provider>
  );
}

export function useBgColor() {
  return useContext(BgColorContext);
}
