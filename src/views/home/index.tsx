import Head from "next/head";
import { BN } from "@project-serum/anchor";
import { FC, useState, useEffect, useCallback, useRef } from "react";
import {
  Connection,
  SystemProgram,
  Transaction,
  PublicKey,
  ComputeBudgetProgram,
  LAMPORTS_PER_SOL,
} from "@solana/web3.js";
import { notify } from "utils/notifications";
import { deposit as depositInstruction } from "../../idl/instructions"; // Update with the correct path
import "react-tooltip/dist/react-tooltip.css";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import useUserSOLBalanceStore from "../../stores/useUserSOLBalanceStore";
import axios from "axios";
import dynamic from "next/dynamic";
import { usePriorityFee } from "../../contexts/PriorityFee";
import { VaultDepositor, VaultDepositorJSON } from "idl/accounts";
import { Vault, VaultJSON } from "idl/accounts";
import { initializeVaultDepositor as initVaultDepositor } from "../../idl/instructions"; // Update with the correct path
import { cancelRequestWithdraw } from "../../idl/instructions"; // Update with the correct path
import { requestWithdraw } from "../../idl/instructions"; // Update with the correct path
import { withdraw } from "../../idl/instructions"; // Update with the correct path
import { Token, Shares, SharesPercent } from "../../idl/types/WithdrawUnit";
import LineChart from "../../components/Chart";
import Dropdown from "../../components/Dropdown";
import { time } from "console";
import Link from "next/link";

const WalletMultiButtonDynamic = dynamic(
  async () =>
    (await import("@solana/wallet-adapter-react-ui")).WalletMultiButton,
  { ssr: false }
);

const VAULT_ADDRESS = new PublicKey(process.env.NEXT_PUBLIC_VAULT_ADDRESS);
const SOL_VAULT_ADDRESS = new PublicKey(process.env.NEXT_PUBLIC_SOL_VAULT);

function getVaultDepositorAddressSync(
  programId: PublicKey,
  vault: PublicKey,
  authority: PublicKey
): PublicKey {
  return PublicKey.findProgramAddressSync(
    [
      Buffer.from(new TextEncoder().encode("vault_depositor")),
      vault.toBuffer(),
      authority.toBuffer(),
    ],
    programId
  )[0];
}

async function checkVaultData(
  vault: PublicKey,
  connection: Connection
): Promise<VaultJSON | null> {
  const vaultData = await Vault.fetch(connection, vault);

  if (!vaultData) {
    console.log("Vault depositor account not found.");
    return null;
  }

  return vaultData.toJSON();
}

require("dotenv").config();

export const HomeView: FC = () => {
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();
  const { getUserSOLBalance, getUserUSDCBalance } = useUserSOLBalanceStore();
  const [vaultData, setVaultData] = useState<VaultJSON | null>(null);
  const [vaultDataSol, setVaultSolData] = useState<VaultJSON | null>(null);
  const [vaultEquity, setVaultEquity] = useState(null);
  const [jlpPremium, setJLPPremium] = useState(null);

  useEffect(() => {
    if (publicKey) {
      getUserSOLBalance(publicKey, connection);
    }
  }, [publicKey, connection]);

  useEffect(() => {
    const fetchVaultData = async () => {
      try {
        const response = await fetch(
          `https://hedgy-data-26a7de9add15.herokuapp.com/api/vaults/equity`
          // `http://localhost:3050/api/vaults/equity`
        );
        const data = await response.json();
        setVaultEquity(data.vaultEquity);
        setJLPPremium(data.jlpPremium);
      } catch (error) {
        console.error("Error fetching vault equity:", error);
      }
    };
    fetchVaultData();
  }, []);

  useEffect(() => {
    if (connection) {
      const fetchVaultData = async () => {
        const data = await checkVaultData(VAULT_ADDRESS, connection);
        console.log(data);
        setVaultData(data);
      };
      const fetchVaultSolData = async () => {
        const data = await checkVaultData(SOL_VAULT_ADDRESS, connection);
        console.log(data);
        setVaultSolData(data);
      };
      fetchVaultData();
      fetchVaultSolData();
    }
  }, [connection]);

  return (
    <div className="overflow-hidden">
      <Head>
        <title>Hedgy</title>
        <meta
          name="description"
          content="Hedgy is an advanced delta-neutral strategy built on the JLP token and Drift Trade platform. Designed to maximize returns while minimizing market risks, Hedgy offers an automated approach to optimizing your investment strategy."
        />
        <meta name="keywords" content="Delta Neutral, DeFi, JLP, Drift Trade" />{" "}
        {/* SEO keywords */}
        <meta name="author" content="" />
        {/* Open Graph and Twitter meta tags as mentioned above */}
        <meta property="og:title" content="Hedgy Market" />
        <meta
          property="og:description"
          content="Hedgy is an advanced delta-neutral strategy built on the JLP token and Drift Trade platform. Designed to maximize returns while minimizing market risks, Hedgy offers an automated approach to optimizing your investment strategy."
        />
        <meta property="og:image" content="/strat.png" />
        <meta property="og:url" content="https://hedgy.market/" />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="" />
        <meta
          name="twitter:description"
          content="Hedgy is an advanced delta-neutral strategy built on the JLP token and Drift Trade platform. Designed to maximize returns while minimizing market risks, Hedgy offers an automated approach to optimizing your investment strategy."
        />
        <meta name="twitter:image" content="/strat.png" />
        <link rel="icon" href="/hedgy.svg" />
      </Head>

      <div className="flex justify-center items-top min-h-[calc(100vh-172px)] z-100 ">
        <div className="gap-4 max-w-[1550px] flex flex-col md:flex-row justify-center items-start pt-8">
          <div className="self-stretch w-full min-w-[330px] md:w-1/2">
            <Link
              href="/strat/usdc"
              passHref
              className="hover:no-underline no-underline"
            >
              <div className="rounded-2xl no-underline flex flex-col gap-6 cursor-pointer transition-shadow duration-300 hover:shadow-[0px_2px_20px_rgba(255,255,255,0.2)]">
                <div className="w-full md:min-w-[380px] flex flex-col">
                  <div className="w-full rounded-2xl overflow-hidden text-left text-base py-6 text-neutral-06 font-gilroy-bold [background:linear-gradient(130deg,_#101011,_#1d1d22_49.21%,_#0f1011)] border-layer-2 border-[1px] border-solid">
                    <div className="lg:flex  w-full flex flex-col lg:gap-0 md:gap-4  md:px-10 items-center justify-between box-border text-[20px] font-gilroy-semibold">
                      <div className="flex flex-col items-center justify-start  px-2 md:gap-[16px] md:rounded-2xl  lg:[backdrop-filter:blur(0px)] md:[backdrop-filter:blur(20px)] rounded-2xl">
                        <div className="relative group profile-picture-container w-16 h-16">
                          {/* Display the current profile image */}
                          <img
                            className={`w-16 h-16 rounded-full object-cover`}
                            alt="Profile"
                            src="/usdc.png"
                          />

                          {/* Hidden file input to select new image */}
                        </div>
                        <div className="flex flex-col items-center justify-center gap-[4px] ">
                          <div className="self-stretch relative tracking-[-0.03em] leading-[120.41%]  text-center">
                            JLP Delta Neutral Strategy
                          </div>

                          <div className="opacity-[0.4] text-[15px] tracking-[-0.03em] leading-[120.41%] font-gilroy-regular inline-block">
                            Maximize your USDC Yield
                          </div>
                        </div>
                        <div className="rounded-2xl flex flex-col items-center justify-center  box-border text-base font-gilroy-medium">
                          <div className="flex flex-col items-center justify-center md:items-end md:justify-center gap-[4px] ">
                            <div className="text-[36px] self-stretch relative tracking-[-0.03em] leading-[120.41%]">
                              {"> "}50%{" "}
                              <span className="opacity-[0.4]">APY</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          </div>
          <div className="self-stretch w-full md:w-1/2">
            <Link
              href="/strat/sol"
              passHref
              className="hover:no-underline no-underline"
            >
              <div className="rounded-2xl no-underline flex flex-col gap-6 cursor-pointer transition-shadow duration-300 hover:shadow-[0px_2px_20px_rgba(255,255,255,0.2)]">
                <div className="w-full md:min-w-[380px] flex flex-col">
                  <div className="w-full rounded-2xl overflow-hidden text-left text-base py-6 text-neutral-06 font-gilroy-bold [background:linear-gradient(130deg,_#101011,_#1d1d22_49.21%,_#0f1011)] border-layer-2 border-[1px] border-solid">
                    <div className="lg:flex  w-full flex flex-col lg:gap-0 md:gap-4  px-2 md:px-10 items-center justify-between box-border text-[20px] font-gilroy-semibold">
                      <div className="flex flex-col items-center justify-start  px-2 md:gap-[16px] md:rounded-2xl  lg:[backdrop-filter:blur(0px)] md:[backdrop-filter:blur(20px)] rounded-2xl">
                        <div className="relative group profile-picture-container w-16 h-16">
                          {/* Display the current profile image */}
                          <img
                            className={`w-16 h-16 rounded-full object-cover`}
                            alt="Profile"
                            src="/sol.png"
                          />

                          {/* Hidden file input to select new image */}
                        </div>
                        <div className="flex flex-col items-center justify-center gap-[4px]  text-center">
                          <div className="relative tracking-[-0.03em] leading-[120.41%] text-center">
                            JLP - SOL Exposure Strategy
                          </div>

                          <div className="opacity-[0.4] text-[15px] tracking-[-0.03em] leading-[120.41%] font-gilroy-regular inline-block">
                            Maximize your SOL Yield
                          </div>
                        </div>
                        <div className="rounded-2xl flex flex-col items-center justify-center  box-border text-base font-gilroy-medium">
                          <div className="flex flex-col items-center justify-center md:items-end md:justify-center gap-[4px] ">
                            <div className="text-[36px] self-stretch relative tracking-[-0.03em] leading-[120.41%] text-center ">
                              {"> "}25%{" "}
                              <span className="opacity-[0.4]">APY</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
