import { createContext, useContext, useState, ReactNode } from 'react';

interface BgColorContextType {
  bgColor: string;
  setBgColor: (color: string) => void;
}

const BgColorContext = createContext<BgColorContextType>({
  bgColor: '#FFFFFF',
  setBgColor: () => {},
});

export function BgColorProvider({ children }: { children: ReactNode }) {
  const [bgColor, setBgColor] = useState('#FFFFFF');
  return (
    <BgColorContext.Provider value={{ bgColor, setBgColor }}>
      {children}
    </BgColorContext.Provider>
  );
}

export function useBgColor() {
  return useContext(BgColorContext);
}
