import React, { createContext, useContext, useState } from "react";

const BackupOracleContext = createContext({
  isBackupOracle: true,
  setBackupOracle: undefined, // Remove the default implementation
});

export const BackupOracleProvider = ({ children }) => {
  const [isBackupOracle, setIsBackupOracle] = useState(true);

  const setBackupOracle = (value: boolean) => {
    setIsBackupOracle(value);
  };

  return (
    <BackupOracleContext.Provider value={{ isBackupOracle, setBackupOracle }}>
      {children}
    </BackupOracleContext.Provider>
  );
};

export const useBackupOracle = () => {
  const context = useContext(BackupOracleContext);

  if (!context) {
    throw new Error("usePriorityFee must be used within a PriorityFeeProvider");
  }

  return context;
};
