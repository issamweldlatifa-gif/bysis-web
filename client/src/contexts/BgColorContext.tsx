import { createContext, useContext, useState, ReactNode } from 'react';

interface BgColorContextType {
  bgColor: string;
  setBgColor: (color: string) => void;
}

const BgColorContext = createContext<BgColorContextType>({
  bgColor: '#8d847c',
  setBgColor: () => {},
});

export function BgColorProvider({ children }: { children: ReactNode }) {
  const [bgColor, setBgColor] = useState('#8d847c');

  // Update meta theme-color dynamically so iOS status bar matches background
  const setColorAndMeta = (color: string) => {
    setBgColor(color);
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', color);
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
