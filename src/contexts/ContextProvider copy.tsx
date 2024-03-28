import { WalletAdapterNetwork, WalletError } from "@solana/wallet-adapter-base";
import {
  ConnectionProvider,
  WalletProvider,
} from "@solana/wallet-adapter-react";
import {
  PhantomWalletAdapter,
  SolflareWalletAdapter,
  TorusWalletAdapter,
  LedgerWalletAdapter,
} from "@solana/wallet-adapter-wallets";
import { clusterApiUrl } from "@solana/web3.js";
import React, { FC, ReactNode, useCallback, useMemo, useState } from "react";
import { AutoConnectProvider, useAutoConnect } from "./AutoConnectProvider";
import { notify } from "../utils/notifications";
import {
  NetworkConfigurationProvider,
  useNetworkConfiguration,
} from "./NetworkConfigurationProvider";
import dynamic from "next/dynamic";

const MAINNET_BETA_ENDPOINTS = [
  process.env.NEXT_PUBLIC_ENDPOINT5,
  // ... add more endpoints as needed
];

const ReactUIWalletModalProviderDynamic = dynamic(
  async () =>
    (await import("@solana/wallet-adapter-react-ui")).WalletModalProvider,
  { ssr: false }
);

const WalletContextProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [currentEndpointIndex, setCurrentEndpointIndex] = useState(0);
  const { autoConnect } = useAutoConnect();
  const { networkConfiguration } = useNetworkConfiguration();
  const network = networkConfiguration as WalletAdapterNetwork;

  const endpoint = useMemo(() => {
    if (network === "mainnet-beta") {
      return MAINNET_BETA_ENDPOINTS[currentEndpointIndex];
    } else {
      return MAINNET_BETA_ENDPOINTS[currentEndpointIndex];
    }
  }, [network, currentEndpointIndex]);

  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
      new SolflareWalletAdapter(),
      new TorusWalletAdapter(),
      new LedgerWalletAdapter(),
    ],
    [network]
  );

  const onError = useCallback(
    (error: WalletError) => {
      notify({
        type: "error",
        message: error.message ? `${error.name}: ${error.message}` : error.name,
      });
      console.error(error);

      // Switch to next endpoint for mainnet-beta in case of specific errors
      if (network === "mainnet-beta" && error.name === "SomeSpecificError") {
        setCurrentEndpointIndex(
          (prevIndex) => (prevIndex + 1) % MAINNET_BETA_ENDPOINTS.length
        );
      }
    },
    [network]
  );

  return (
    // TODO: updates needed for updating and referencing endpoint: wallet adapter rework
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider
        wallets={wallets}
        onError={onError}
        autoConnect={autoConnect}
      >
        <ReactUIWalletModalProviderDynamic>
          {children}
        </ReactUIWalletModalProviderDynamic>
      </WalletProvider>
    </ConnectionProvider>
  );
};

export const ContextProvider: FC<{ children: ReactNode }> = ({ children }) => {
  return (
    <>
      <NetworkConfigurationProvider>
        <AutoConnectProvider>
          <WalletContextProvider>{children}</WalletContextProvider>
        </AutoConnectProvider>
      </NetworkConfigurationProvider>
    </>
  );
};
