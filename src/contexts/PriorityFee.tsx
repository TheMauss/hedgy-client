import React, { createContext, useContext, useState } from "react";

const PriorityFeeContext = createContext({
  isPriorityFee: false,
  setPriorityFee: undefined, // Remove the default implementation
});

export const PriorityFeeProvider = ({ children }) => {
  const [isPriorityFee, setIsPriorityFee] = useState(false);

  const setPriorityFee = (value: boolean) => {
    setIsPriorityFee(value);
  };

  return (
    <PriorityFeeContext.Provider value={{ isPriorityFee, setPriorityFee }}>
      {children}
    </PriorityFeeContext.Provider>
  );
};

export const usePriorityFee = () => {
  const context = useContext(PriorityFeeContext);

  if (!context) {
    throw new Error("usePriorityFee must be used within a PriorityFeeProvider");
  }

  return context;
};
