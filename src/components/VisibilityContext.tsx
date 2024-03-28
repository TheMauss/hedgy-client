// VisibilityContext.tsx

import React, { createContext, useContext, useState, ReactNode } from "react";

interface VisibilityContextType {
  isVisible: boolean;
  setIsVisible: (isVisible: boolean) => void;
}

const defaultState = {
  isVisible: false,
  setIsVisible: () => {},
};

const VisibilityContext = createContext<VisibilityContextType>(defaultState);

interface VisibilityProviderProps {
  children: ReactNode;
}

export const VisibilityProvider: React.FC<VisibilityProviderProps> = ({
  children,
}) => {
  const [isVisible, setIsVisible] = useState<boolean>(false);

  return (
    <VisibilityContext.Provider value={{ isVisible, setIsVisible }}>
      {children}
    </VisibilityContext.Provider>
  );
};

export const useVisibility = (): VisibilityContextType =>
  useContext(VisibilityContext);
