// components/withAccessControl.tsx
import { NextComponentType, NextPageContext } from "next";
import { useEffect, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { hasAccess } from "../utils/checkAccess";
import dynamic from "next/dynamic";

const WalletMultiButtonDynamic = dynamic(
  async () =>
    (await import("@solana/wallet-adapter-react-ui")).WalletMultiButton,
  { ssr: false }
);

const withAccessControl = (Component: NextComponentType<NextPageContext>) => {
  const AccessControlledComponent = (props: any) => {
    const { publicKey } = useWallet();
    const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

    useEffect(() => {
      const checkUserAccess = async () => {
        if (publicKey) {
          const access = await hasAccess(publicKey);
          setIsAuthorized(access);
        } else {
          setIsAuthorized(false);
        }
      };
      checkUserAccess();
    }, [publicKey]);

    if (!publicKey) {
      return (
        <div className="font-gilroy-regular flex items-center justify-center min-h-[calc(100vh-172px)]">
          <div className="text-center max-w-md p-6 rounded-lg shadow-lg text-center">
            <h2 className="text-2xl font-semibold text-white mb-4">
              Please Log In
            </h2>
            <p className="text-gray-300 mb-6">
              You need to connect your wallet to access this content.
            </p>
            <WalletMultiButtonDynamic
              className="[background:linear-gradient(45deg,_#1cc5de,_#c7ee89)] text-black box-border flex flex-row items-center justify-center btn-ghost"
              style={{
                width: "100%",
                height: 38,
                borderRadius: 8,
                background: "linear-gradient(45deg, #1cc5de, #c7ee89)", // Use `background` for gradients
                backgroundColor: "#0C1E1B",
                color: "black",
              }}
            />
          </div>
        </div>
      );
    }

    if (isAuthorized === null) {
      return (
        <div className="font-gilroy-regular flex items-center justify-center min-h-[calc(100vh-172px)]">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-white text-lg font-medium">Checking access...</p>
          </div>
        </div>
      );
    }

    if (!isAuthorized) {
      return (
        <div className="font-gilroy-regular flex items-center justify-center min-h-[calc(100vh-172px)]">
          <div className="max-w-md p-6 rounded-lg shadow-lg text-center">
            <h2 className="text-2xl font-semibold text-white mb-4">
              Access Denied
            </h2>
            <p className="text-gray-300">
              You don’t have the necessary permissions to access this content.
            </p>
          </div>
        </div>
      );
    }

    return <Component {...props} />;
  };

  return AccessControlledComponent;
};

export default withAccessControl;
