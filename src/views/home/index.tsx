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
      <div className="flex flex-col items-center justify-start font-gilroy-regular w-full overflow-hidden text-37xl text-neutral-06 gap-6">
        <div className="w-[60%] flex flex-col items-center justify-start gap-32">
          <div className="w-full flex flex-col items-center justify-center gap-3 text-center text-[64px] text-grey-text pt-12">
            <div className="font-gilroy-semibold self-stretch relative tracking-[-0.21px] text-transparent !bg-clip-text [background:linear-gradient(45deg,_#1cc5de,_#c7ee89)] [-webkit-background-clip:text] [-webkit-text-fill-color:transparent]">
              Maximize Your Yield
            </div>
            <div className="self-stretch relative text-xl tracking-[-0.21px] text-center">
              Multiply your yields with delta-neutral market making and
              liquidity provision strategies
            </div>
            <div className="flex flex-row items-center justify-start gap-20 text-13xl pt-12">
              <div className="w-[207.5px] flex flex-row items-center justify-center">
                <div className="flex flex-col items-center justify-start">
                  <div className="relative tracking-[-0.21px] font-medium">
                    $233,432.43
                  </div>
                  <div className="relative text-lg text-grey-text">
                    Total Value Locked
                  </div>
                </div>
              </div>
              <div className="w-[207.5px] flex flex-row items-center justify-center">
                <div className="flex flex-col items-center justify-start">
                  <div className="relative tracking-[-0.21px] font-medium">
                    $56,752.87
                  </div>
                  <div className="relative text-lg text-grey-text">
                    Total P&L
                  </div>
                </div>
              </div>
            </div>
            <div className="w-full flex flex-row items-center justify-center gap-8 pt-12 text-5xl">
              <div className="w-1/2 rounded-2xl [background:linear-gradient(115.04deg,_#101011,_#1d1d22_49.21%,_#0f1011)] border-layer-2 border-[1px] border-solid box-border flex flex-col items-start justify-start p-6 gap-6 cursor-pointer transition-shadow duration-300 hover:shadow-[0px_2px_20px_rgba(255,255,255,0.2)]">
                <Link
                  href="/strat/usdc"
                  passHref
                  className="w-full text-white hover:no-underline no-underline self-stretch flex flex-col items-center justify-center gap-2"
                >
                  <div className="self-stretch flex flex-col items-center justify-center gap-2">
                    <div className="rounded-lg overflow-hidden flex flex-col items-center justify-center gap-2">
                      <img
                        className="w-20 relative rounded-1981xl h-20 overflow-hidden shrink-0 object-cover"
                        alt=""
                        src="/usdc.png"
                      />
                      <div className="flex flex-col items-center justify-center">
                        <div className="relative tracking-[-0.21px]">
                          JLP Delta Neutral Strategy
                        </div>
                        <div className="relative text-base text-grey-text">
                          Maximize your JLP yield
                        </div>
                      </div>
                    </div>
                    <div className="self-stretch flex flex-col items-center justify-center text-19xl-4">
                      <div className="relative">
                        <span>{`50.64% `}</span>
                        <span className="text-grey-text">APY</span>
                      </div>
                    </div>
                  </div>
                  <div className="self-stretch relative border-layer-2 border-t-[1px] border-solid box-border h-px" />
                  <div className="self-stretch flex flex-col items-start justify-start text-xl">
                    <div className="self-stretch flex flex-row items-start justify-start">
                      <div className="flex-1 flex flex-row items-center justify-center">
                        <div className="flex flex-col items-center justify-start">
                          <div className="relative tracking-[-0.21px]">
                            $233,432.43
                          </div>
                          <div className="relative text-sm text-grey-text">
                            TVL
                          </div>
                        </div>
                      </div>
                      <div className="flex-1 flex flex-col items-center justify-center">
                        <div className="relative tracking-[-0.21px]">
                          $22,987.87
                        </div>
                        <div className="relative text-sm text-grey-text">
                          Profit
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="self-stretch rounded-lg [background:linear-gradient(45deg,_#1cc5de,_#c7ee89)] h-12 flex flex-row items-center justify-center p-2 box-border text-lg text-bg1">
                    <div className="relative leading-[120.41%]">View</div>
                  </div>{" "}
                </Link>
              </div>

              <div className="w-1/2 rounded-2xl [background:linear-gradient(115.04deg,_#101011,_#1d1d22_49.21%,_#0f1011)] border-layer-2 border-[1px] border-solid box-border flex flex-col items-start justify-start p-6 gap-6 cursor-pointer transition-shadow duration-300 hover:shadow-[0px_2px_20px_rgba(255,255,255,0.2)]">
                <Link
                  href="/strat/sol"
                  passHref
                  className="w-full text-white hover:no-underline no-underline self-stretch flex flex-col items-center justify-center gap-2"
                >
                  <div className="self-stretch flex flex-col items-center justify-center gap-2">
                    <div className="rounded-lg overflow-hidden flex flex-col items-center justify-center gap-2">
                      <img
                        className="w-20 relative rounded-1981xl h-20 overflow-hidden shrink-0 object-cover"
                        alt=""
                        src="/sol.png"
                      />
                      <div className="flex flex-col items-center justify-center">
                        <div className="relative tracking-[-0.21px]">
                          JLP-SOL Exposure Strategy
                        </div>
                        <div className="relative text-base text-grey-text">
                          Maximize your SOL yield
                        </div>
                      </div>
                    </div>
                    <div className="self-stretch flex flex-col items-center justify-center text-19xl-4">
                      <div className="relative">
                        <span>{`25% `}</span>
                        <span className="text-grey-text">APY</span>
                      </div>
                    </div>
                  </div>
                  <div className="self-stretch relative border-layer-2 border-t-[1px] border-solid box-border h-px" />
                  <div className="self-stretch flex flex-col items-start justify-start text-xl">
                    <div className="self-stretch flex flex-row items-start justify-start">
                      <div className="flex-1 flex flex-row items-center justify-center">
                        <div className="flex flex-col items-center justify-start">
                          <div className="relative tracking-[-0.21px]">
                            $233,432.43
                          </div>
                          <div className="relative text-sm text-grey-text">
                            TVL
                          </div>
                        </div>
                      </div>
                      <div className="flex-1 flex flex-col items-center justify-center">
                        <div className="relative tracking-[-0.21px]">
                          $22,987.87
                        </div>
                        <div className="relative text-sm text-grey-text">
                          Profit
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="self-stretch rounded-lg [background:linear-gradient(45deg,_#1cc5de,_#c7ee89)] h-12 flex flex-row items-center justify-center p-2 box-border text-lg text-bg1">
                    <div className="relative leading-[120.41%]">View</div>
                  </div>{" "}
                </Link>
              </div>
            </div>
          </div>

          <div className="w-full flex flex-row items-center justify-start gap-4 text-5xl pt-16">
            <div className="items-center justify-center tracking-[-0.21px] leading-[120%] inline-block text-transparent !bg-clip-text [background:linear-gradient(45deg,_#1cc5de,_#c7ee89)] [-webkit-background-clip:text] [-webkit-text-fill-color:transparent] w-[496.4px]">
              How Does It Work?
            </div>
            <div className="flex flex-col">
              <div className="self-stretch rounded-2xl [background:linear-gradient(115.04deg,_#101011,_#1d1d22_49.21%,_#0f1011)] border-layer-2 border-[1px] border-solid flex flex-row items-center justify-start p-6 gap-6">
                <img
                  className="w-20 relative rounded-1981xl h-20 overflow-hidden shrink-0"
                  alt=""
                  src="/tokeneth.svg"
                />
                <div className="flex-1 flex flex-col items-start justify-center gap-1">
                  <div className="relative">Depositor</div>
                  <div className="self-stretch relative text-xl inline-block h-12 shrink-0">
                    Deposits USDC or SOL into Hedgy’s vault on Drift.
                  </div>
                </div>
              </div>
              <div className="gap-6 self-stretch rounded-2xl [background:linear-gradient(115.04deg,_#101011,_#1d1d22_49.21%,_#0f1011)] border-layer-2 border-[1px] border-solid flex flex-row items-center justify-start p-6 gap-6">
                <img
                  className="w-20 relative rounded-1981xl h-20 overflow-hidden shrink-0"
                  alt=""
                  src="/hedgyss.png"
                />
                <div className="flex-1 flex flex-col items-start justify-center gap-1">
                  <div className="relative">Hedgy</div>
                  <div className="self-stretch relative text-xl inline-block h-12 shrink-0">
                    Swaps into JLP and balances the strategy.
                  </div>
                </div>
              </div>
              <div className="self-stretch rounded-2xl [background:linear-gradient(115.04deg,_#101011,_#1d1d22_49.21%,_#0f1011)] border-layer-2 border-[1px] border-solid flex flex-row items-center justify-start p-6 gap-6">
                <img
                  className="w-20 relative rounded-1981xl h-20 overflow-hidden shrink-0 object-cover"
                  alt=""
                  src="/tokeneth7@2x.png"
                />
                <div className="flex-1 flex flex-col items-start justify-center gap-1">
                  <div className="relative">Yield</div>
                  <div className="self-stretch relative text-xl inline-block h-12 shrink-0">
                    Hourly yield distributed to JLP holders.
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="w-full flex flex-row items-center justify-between gap-4 text-5xl pt-16">
            <div className="md:hidden flex flex-col items-center justify-center tracking-[-0.21px] leading-[120%] inline-block text-transparent !bg-clip-text [background:linear-gradient(45deg,_#1cc5de,_#c7ee89)] [-webkit-background-clip:text] [-webkit-text-fill-color:transparent] w-[496.4px]">
              <div className="m-0">Follow Us On X</div>
              <div className="m-0">Join the Discord</div>
            </div>
            <div className="flex flex-row">
              <div className="flex flex-col items-center justify-center gap-4 text-lg">
                <img
                  className="self-stretch relative rounded-2xl max-w-full overflow-hidden h-[182px] shrink-0"
                  alt=""
                  src="/frame-20856603621.svg"
                />
                <div className="self-stretch rounded-lg [background:linear-gradient(90.72deg,_rgba(73,_246,_255,_0.1),_rgba(98,_143,_255,_0.1))] border-aqua border-[2px] border-solid box-border h-12 flex flex-row items-center justify-center p-2">
                  <div className="relative leading-[120.41%] text-transparent !bg-clip-text [background:linear-gradient(90.72deg,_#49f6ff,_#628fff)] [-webkit-background-clip:text] [-webkit-text-fill-color:transparent]">
                    Follow
                  </div>
                </div>
              </div>
              <div className="flex flex-col items-start justify-start gap-4 text-lg">
                <img
                  className="self-stretch relative rounded-2xl max-w-full overflow-hidden h-[182px] shrink-0"
                  alt=""
                  src="/frame-2085660363.svg"
                />
                <div className="self-stretch rounded-lg [background:linear-gradient(90.72deg,_rgba(143,_73,_255,_0.1),_rgba(203,_98,_255,_0.1))] border-blueviolet border-[2px] border-solid box-border h-12 flex flex-row items-center justify-center p-2">
                  <div className="relative leading-[120.41%] text-transparent !bg-clip-text [background:linear-gradient(90.72deg,_#8f49ff,_#cb62ff)] [-webkit-background-clip:text] [-webkit-text-fill-color:transparent]">
                    Join
                  </div>
                </div>
              </div>{" "}
            </div>
            <div className="text-end hidden md:flex flex-col  tracking-[-0.21px] leading-[120%] inline-block text-transparent !bg-clip-text [background:linear-gradient(45deg,_#1cc5de,_#c7ee89)] [-webkit-background-clip:text] [-webkit-text-fill-color:transparent]">
              <div className="m-0">Follow Us On X</div>
              <div className="m-0">Join the Discord</div>
            </div>
          </div>
          <div className="w-full flex flex-row justify-between items-center py-16">
            <div className="w-1/2 tracking-[-0.21px] leading-[120%] inline-block text-transparent !bg-clip-text [background:linear-gradient(45deg,_#1cc5de,_#c7ee89)] [-webkit-background-clip:text] [-webkit-text-fill-color:transparent] w-[400.8px]">
              Documentation
            </div>
            <div className="w-1/2 rounded-2xl [background:linear-gradient(115.04deg,_#101011,_#1d1d22_49.21%,_#0f1011)] border-layer-2 border-[1px] border-solid box-border flex flex-col items-start justify-center p-6 gap-6 text-21xl">
              <img
                className="self-stretch relative rounded-lg overflow-hidden shrink-0"
                alt=""
                src="/frame-2085660362.svg"
              />
              <div className="self-stretch flex flex-col items-start justify-start gap-4">
                <div className="self-stretch relative inline-block h-12 shrink-0">
                  Gitbook
                </div>
                <div className="relative text-xl">Learn more about Hedgy</div>
              </div>
              <div className="self-stretch rounded-lg border-primary1 border-[2px] border-solid box-border h-12 flex flex-row items-center justify-center p-2 gap-2 text-lg">
                <div className="relative leading-[120.41%] text-transparent !bg-clip-text [background:linear-gradient(45deg,_#1cc5de,_#c7ee89)] [-webkit-background-clip:text] [-webkit-text-fill-color:transparent]">
                  View
                </div>
                <img
                  className="w-5 relative h-5"
                  alt=""
                  src="/vuesaxlinearexport.svg"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
