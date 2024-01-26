import React, {
  createContext,
  useContext,
  useState,
  Dispatch,
  SetStateAction,
} from "react";

type FastTradeContextType = {
  fastTradeActivated: boolean;
  setFastTradeActivated: Dispatch<SetStateAction<boolean>>;
};

const defaultContextValue: FastTradeContextType = {
  fastTradeActivated: false,
  setFastTradeActivated: () => {
    console.warn(
      "setFastTradeActivated has been called without a FastTradeProvider"
    );
  },
};

const FastTradeContext =
  createContext<FastTradeContextType>(defaultContextValue);

export const useFastTrade = () => {
  return useContext(FastTradeContext);
};

export const FastTradeProvider = ({ children }) => {
  const [fastTradeActivated, setFastTradeActivated] = useState(false);

  return (
    <FastTradeContext.Provider
      value={{ fastTradeActivated, setFastTradeActivated }}
    >
      {children}
    </FastTradeContext.Provider>
  );
};
