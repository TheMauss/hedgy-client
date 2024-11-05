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
import MouseTrail from "components/MouseTrail";
import { motion } from "framer-motion";

const StarfieldAnimationComponentWithNoSSR = dynamic(
  () => import("components/StarfieldAnimationComponent"),
  { ssr: false }
);

const WalletMultiButtonDynamic = dynamic(
  async () =>
    (await import("@solana/wallet-adapter-react-ui")).WalletMultiButton,
  { ssr: false }
);

const VAULT_ADDRESS = new PublicKey(process.env.NEXT_PUBLIC_VAULT_ADDRESS);
const SOL_VAULT_ADDRESS = new PublicKey(process.env.NEXT_PUBLIC_SOL_VAULT);

const fetchHistoricalPriceUpdates = async (timestamp, ids) => {
  const baseURL = "https://benchmarks.pyth.network/v1/updates/price/";
  const url = `${baseURL}${timestamp}`;
  const params = ids.map((id) => `ids=${id}`).join("&");
  const fullUrl = `${url}?${params}`;

  console.log(`Fetching data from URL: ${fullUrl}`);

  try {
    const response = await axios.get(fullUrl);
    return response.data;
  } catch (error) {
    console.error("Error fetching historical price updates:", error);
    return null;
  }
};

const priceIdToSymbolMap = {
  ef0d8b6fda2ceba41da15d4095d1da392a0d2f8ed0c6c7bc0f4cfac8c280b56d:
    "Crypto.SOL/USD",
  // Add more mappings as necessary
};

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
  const [vaultEquitySol, setVaultEquitySol] = useState(null);
  const [apy, setApy] = useState(null);
  const [apySol, setApySol] = useState(null);
  const [openPrices, setopenPrices] = useState({});
  const [prices, setPrices] = useState({});

  useEffect(() => {
    if (publicKey) {
      getUserSOLBalance(publicKey, connection);
    }
  }, [publicKey, connection]);

  useEffect(() => {
    const currentDate = new Date();
    const gmt2Date = new Date(currentDate.getTime() - 50000);
    const timestamp = Math.floor(gmt2Date.getTime() / 1000);

    const ids = Object.keys(priceIdToSymbolMap);

    const fetchPrices = async () => {
      const priceUpdates = await fetchHistoricalPriceUpdates(timestamp, ids);

      if (priceUpdates && priceUpdates.parsed) {
        const updatedPrices = { ...openPrices };
        priceUpdates.parsed.forEach((priceUpdate) => {
          const symbol = priceIdToSymbolMap[priceUpdate.id];
          if (symbol) {
            updatedPrices[symbol] = priceUpdate.price.price;
          }
        });

        setPrices(updatedPrices);
        console.log("updatedPrices", updatedPrices);
      }
    };

    fetchPrices();
  }, []);

  useEffect(() => {
    const fetchVaultData = async () => {
      try {
        const response = await fetch(
          `https://hedgy-data-26a7de9add15.herokuapp.com/api/vaults/equity`
          // `http://localhost:3050/api/vaults/equity`
        );
        const data = await response.json();
        setVaultEquity(data.vaultEquity);
        setApy(Number(data.apy)); // Store APY with compounding in the state
      } catch (error) {
        console.error("Error fetching vault equity:", error);
      }
    };
    fetchVaultData();
  }, []);

  useEffect(() => {
    const fetchVaultData = async () => {
      try {
        const response = await fetch(
          `https://hedgy-data-26a7de9add15.herokuapp.com/api/vaults-sol/equity`
          // `http://localhost:3050/api/vaults-sol/equity`
        );
        const data = await response.json();
        setVaultEquitySol(data.vaultEquity);
        setApySol(Number(data.apy)); // Store APY with compounding in the state
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

  const fadeInUp = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };

  return (
    <>
      <>
        {console.log("Rendering StarfieldAnimation")}
        <div className="">
          <StarfieldAnimationComponentWithNoSSR />
        </div>
      </>
      <div className="overflow-hidden">
        <Head>
          <title>Hedgy</title>
          <meta
            name="description"
            content="Hedgy is an advanced delta-neutral strategy built on the JLP token and Drift Trade platform. Designed to maximize returns while minimizing market risks, Hedgy offers an automated approach to optimizing your investment strategy."
          />
          <meta
            name="keywords"
            content="Delta Neutral, DeFi, JLP, Drift Trade"
          />{" "}
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
          <div className="w-[90%] md:w-[85%] w-[60%] max-w-[1085px] flex flex-col items-center justify-start gap-32">
            <div className="z-10 w-full flex flex-col items-center justify-center gap-3 text-center text-[64px] text-grey-text pt-12">
              <div className="font-gilroy-semibold self-stretch relative tracking-[-0.21px] text-transparent !bg-clip-text [background:linear-gradient(45deg,_#1cc5de,_#c7ee89)] [-webkit-background-clip:text] [-webkit-text-fill-color:transparent]">
                Maximize Your Yield
              </div>
              <div className="self-stretch relative text-xl tracking-[-0.21px] text-center opacity-[0.5]">
                Multiply your yields with advanced TradFi strategies
              </div>
              <div className="flex flex-col md:flex-row items-center justify-start  gap-6 md:gap-20 text-13xl pt-6 md:pt-12">
                <div className="w-[207.5px] flex flex-row items-center justify-center">
                  <div className="flex flex-col items-center justify-start">
                    <div className="relative tracking-[-0.21px] font-medium">
                      $
                      {isNaN(Number(vaultEquity) / 10e5) ||
                      vaultEquity === null ||
                      vaultData?.netDeposits === undefined ||
                      isNaN(Number(vaultEquitySol) / 10e8) ||
                      vaultEquitySol === null ||
                      vaultDataSol?.netDeposits === undefined ? (
                        <div className="bg-layer-2 spinner-border animate-spin inline-block w-6 h-4 border-2 rounded-full border-t-transparent"></div>
                      ) : (
                        (
                          Number(vaultEquity) / 10e5 +
                          (Number(vaultEquitySol) / 10e8) *
                            Number(
                              (prices["Crypto.SOL/USD"] / 100000000).toFixed(1)
                            )
                        ).toFixed(1)
                      )}
                    </div>
                    <div className="relative text-lg opacity-[0.5]">
                      Total Value Locked
                    </div>
                  </div>
                </div>
                <div className="w-[207.5px] flex flex-row items-center justify-center">
                  <div className="flex flex-col items-center justify-start">
                    <div className="relative tracking-[-0.21px] font-medium">
                      $
                      {isNaN(
                        (Number(vaultEquity) - Number(vaultData?.netDeposits)) /
                          10e5
                      ) ||
                      vaultEquity === null ||
                      vaultData?.netDeposits === undefined ||
                      isNaN(
                        (Number(vaultEquitySol) -
                          Number(vaultDataSol?.netDeposits)) /
                          10e8
                      ) ||
                      vaultEquitySol === null ||
                      vaultDataSol?.netDeposits === undefined ? (
                        <div className="bg-layer-2 spinner-border animate-spin inline-block w-6 h-4 border-2 rounded-full border-t-transparent"></div>
                      ) : (
                        (
                          (Number(vaultEquity) -
                            Number(vaultData?.netDeposits)) /
                            10e5 +
                          ((Number(vaultEquitySol) -
                            Number(vaultDataSol?.netDeposits)) /
                            10e8) *
                            Number(
                              (prices["Crypto.SOL/USD"] / 100000000).toFixed(1)
                            )
                        ).toFixed(1)
                      )}
                    </div>
                    <div className="relative text-lg opacity-[0.5]">
                      Total P&L
                    </div>
                  </div>
                </div>
              </div>
              <div className="w-full flex flex-col md:flex-row items-center justify-center gap-8 pt-6 md:pt-12 text-5xl">
                <div className="w-full md:w-1/2 rounded-2xl [background:linear-gradient(120.04deg,_#101011,_#1d1d22_49.21%,_#0f1011)] border-layer-2 border-[1px] border-solid box-border flex flex-col items-start justify-start p-6 gap-6 cursor-pointer transition-shadow duration-300 hover:shadow-[0px_2px_20px_rgba(255,255,255,0.2)]">
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
                          <div className="font-gilroy-semibold relative tracking-[-0.21px] ">
                            JLP Delta Neutral Strategy
                          </div>
                          <div className="relative text-base opacity-[0.5]">
                            Maximize your USDC yield
                          </div>
                        </div>
                      </div>
                      <div className="self-stretch flex flex-col items-center justify-center text-19xl-4">
                        <div className="text-[36px] font-gilroy-semibold">
                          <span>
                            {" "}
                            {apy !== null ? (
                              <span>
                                {apy.toFixed(2)}%{" "}
                                <span className="opacity-[0.4]">APY</span>
                              </span>
                            ) : (
                              <div className="bg-layer-2 spinner-border animate-spin inline-block w-6 h-4 border-2 rounded-full border-t-transparent"></div>
                            )}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="self-stretch relative border-layer-2 border-t-[1px] border-solid box-border h-px" />
                    <div className="self-stretch flex flex-col items-start justify-start text-xl py-3">
                      <div className="self-stretch flex flex-row items-start justify-start ">
                        <div className="flex-1 flex flex-row items-center justify-center ">
                          <div className="flex flex-col items-center justify-start">
                            <div className="relative tracking-[-0.21px]">
                              ${" "}
                              {isNaN(Number(vaultEquity) / 10e5) ||
                              vaultEquity === null ||
                              vaultData?.netDeposits === undefined ? (
                                <div className="bg-layer-2 spinner-border animate-spin inline-block w-6 h-4 border-2 rounded-full border-t-transparent"></div>
                              ) : (
                                (Number(vaultEquity) / 10e5).toFixed(2)
                              )}
                            </div>
                            <div className="relative text-sm opacity-[0.5]">
                              TVL
                            </div>
                          </div>
                        </div>
                        <div className="flex-1 flex flex-col items-center justify-center">
                          <div className="relative tracking-[-0.21px]">
                            ${" "}
                            {isNaN(
                              (Number(vaultEquity) -
                                Number(vaultData?.netDeposits)) /
                                10e5
                            ) ||
                            vaultEquity === null ||
                            vaultData?.netDeposits === undefined ? (
                              <div className="bg-layer-2 spinner-border animate-spin inline-block w-6 h-4 border-2 rounded-full border-t-transparent"></div>
                            ) : (
                              (
                                (Number(vaultEquity) -
                                  Number(vaultData?.netDeposits)) /
                                10e5
                              ).toFixed(2)
                            )}
                          </div>
                          <div className="relative text-sm opacity-[0.5]">
                            Profit
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="self-stretch rounded-lg [background:linear-gradient(10deg,_#1cc5de,_#c7ee89)] h-12 flex flex-row items-center justify-center p-2 box-border text-lg text-bg1">
                      <div className="relative leading-[120.41%] text-black">
                        View
                      </div>
                    </div>{" "}
                  </Link>
                </div>

                <div className="w-full md:w-1/2 rounded-2xl [background:linear-gradient(120.04deg,_#101011,_#1d1d22_49.21%,_#0f1011)] border-layer-2 border-[1px] border-solid box-border flex flex-col items-start justify-start p-6 gap-6 cursor-pointer transition-shadow duration-300 hover:shadow-[0px_2px_20px_rgba(255,255,255,0.2)]">
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
                          <div className="font-gilroy-semibold relative tracking-[-0.21px]">
                            JLP SOL Exposure Strategy
                          </div>
                          <div className="relative text-base opacity-[0.5]">
                            Maximize your SOL yield
                          </div>
                        </div>
                      </div>
                      <div className="self-stretch flex flex-col items-center justify-center text-19xl-4">
                        <div className="text-[36px] font-gilroy-semibold">
                          <span>
                            {" "}
                            {apySol !== null ? (
                              <span>
                                {apySol.toFixed(2)}%{" "}
                                <span className="opacity-[0.4]">APY</span>
                              </span>
                            ) : (
                              <div className="bg-layer-2 spinner-border animate-spin inline-block w-6 h-4 border-2 rounded-full border-t-transparent"></div>
                            )}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="self-stretch relative border-layer-2 border-t-[1px] border-solid box-border h-px" />
                    <div className="self-stretch flex flex-col items-start justify-start text-xl">
                      <div className="self-stretch flex flex-row items-start justify-start py-3">
                        <div className="flex-1 flex flex-row items-center justify-center">
                          <div className="flex flex-col items-center justify-start">
                            <div className="relative tracking-[-0.21px]">
                              {isNaN(Number(vaultEquity) / 10e8) ||
                              vaultEquitySol === null ||
                              vaultDataSol?.netDeposits === undefined ? (
                                <div className="bg-layer-2 spinner-border animate-spin inline-block w-6 h-4 border-2 rounded-full border-t-transparent"></div>
                              ) : (
                                (Number(vaultEquitySol) / 10e8).toFixed(2)
                              )}{" "}
                              SOL
                            </div>
                            <div className="relative text-sm opacity-[0.5]">
                              TVL
                            </div>
                          </div>
                        </div>
                        <div className="flex-1 flex flex-col items-center justify-center">
                          <div className="relative tracking-[-0.21px]">
                            {isNaN(
                              (Number(vaultEquitySol) -
                                Number(vaultDataSol?.netDeposits)) /
                                10e8
                            ) ||
                            vaultEquity === null ||
                            vaultData?.netDeposits === undefined ? (
                              <div className="bg-layer-2 spinner-border animate-spin inline-block w-6 h-4 border-2 rounded-full border-t-transparent"></div>
                            ) : (
                              (
                                (Number(vaultEquitySol) -
                                  Number(vaultDataSol?.netDeposits)) /
                                10e8
                              ).toFixed(2)
                            )}{" "}
                            SOL
                          </div>
                          <div className="relative text-sm opacity-[0.5]">
                            Profit
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="self-stretch rounded-lg [background:linear-gradient(10deg,_#1cc5de,_#c7ee89)] h-12 flex flex-row items-center justify-center p-2 box-border text-lg text-bg1">
                      <div className="relative leading-[120.41%] text-black">
                        View
                      </div>
                    </div>{" "}
                  </Link>
                </div>
              </div>
            </div>
            <motion.div
              className="z-10 w-full flex flex-col md:flex-row items-center justify-start gap-4 text-5xl md:pt-16"
              initial="hidden"
              whileInView="visible" // Trigger animation when in view
              viewport={{ once: true, amount: 1 }} // Animate once, when 20% of the element is in view
              variants={fadeInUp} // Apply the fadeInUp variant
            >
              <div className="font-gilroy-semibold w-full md:w-1/2 text-center md:text-left md:text-[52px] text-[42px] items-center justify-center tracking-[-0.21px] leading-[120%] inline-block text-transparent !bg-clip-text [background:linear-gradient(45deg,_#1cc5de,_#c7ee89)] [-webkit-background-clip:text] [-webkit-text-fill-color:transparent]">
                How Does It Work?
              </div>
              <div className="flex flex-col gap-6">
                <div className="self-stretch rounded-2xl [background:linear-gradient(130.04deg,_#101011,_#1d1d22_49.21%,_#0f1011)] border-layer-2 border-[1px] border-solid flex flex-row items-center justify-start p-6 gap-6">
                  <img
                    className="w-20 relative rounded-1981xl h-20 overflow-hidden shrink-0"
                    alt=""
                    src="/tokeneth.svg"
                  />
                  <div className="flex-1 flex flex-col items-start justify-center gap-1">
                    <div className="font-gilroy-semibold ">Depositor</div>
                    <div className="self-stretch relative text-xl inline-block shrink-0">
                      Deposits USDC or SOL into Hedgy’s vault on Drift.
                    </div>
                  </div>
                </div>
                <div className="gap-6 self-stretch rounded-2xl [background:linear-gradient(130.04deg,_#101011,_#1d1d22_49.21%,_#0f1011)] border-layer-2 border-[1px] border-solid flex flex-row items-center justify-start p-6 gap-6">
                  <img
                    className="w-20 relative rounded-1981xl h-20 overflow-hidden shrink-0"
                    alt=""
                    src="/hedgyss.png"
                  />
                  <div className="flex-1 flex flex-col items-start justify-center gap-1">
                    <div className="font-gilroy-semibold ">Hedgy</div>
                    <div className="self-stretch relative text-xl inline-blockshrink-0">
                      Swaps into JLP and balances the strategy.
                    </div>
                  </div>
                </div>
                <div className="self-stretch rounded-2xl [background:linear-gradient(130.04deg,_#101011,_#1d1d22_49.21%,_#0f1011)] border-layer-2 border-[1px] border-solid flex flex-row items-center justify-start p-6 gap-6">
                  <img
                    className="w-20 relative rounded-1981xl h-20 overflow-hidden shrink-0 object-cover"
                    alt=""
                    src="/tokeneth7@2x.png"
                  />
                  <div className="flex-1 flex flex-col items-start justify-center gap-1">
                    <div className="font-gilroy-semibold ">Yield</div>
                    <div className="self-stretch relative text-xl inline-block shrink-0">
                      Hourly yield distributed to JLP holders.
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
            <motion.div
              className="w-full flex flex-col md:flex-row justify-between items-center pb-8 md:py-16"
              initial="hidden"
              whileInView="visible" // Trigger animation when in view
              viewport={{ once: true, amount: 0.7 }} // Animate once, when 20% of the element is in view
              variants={fadeInUp} // Apply the fadeInUp variant
            >
              <div className="md:hidden font-gilroy-semibold w-full md:w-1/2 md:text-[52px] text-[42px] text-center md:text-left w-1/2 tracking-[-0.21px] leading-[120%] inline-block text-transparent !bg-clip-text [background:linear-gradient(45deg,_#1cc5de,_#c7ee89)] [-webkit-background-clip:text] [-webkit-text-fill-color:transparent] ">
                Documentation
              </div>
              <div className="w-full md:w-1/2 rounded-2xl [background:linear-gradient(115.04deg,_#101011,_#1d1d22_49.21%,_#0f1011)] border-layer-2 border-[1px] border-solid box-border flex flex-col items-start justify-center p-6 gap-6 text-21xl">
                <img
                  className="self-stretch relative rounded-lg overflow-hidden shrink-0"
                  alt=""
                  src="/frame-2085660362.svg"
                />
                <div className="self-stretch flex flex-col items-start justify-start gap-4">
                  <div className="text-[48px] self-stretch font-gilroy-semibold  inline-block h-12 shrink-0">
                    Gitbook
                  </div>
                  <div className="relative text-xl">Learn more about Hedgy</div>
                </div>
                <a
                  href={`https://docs.hedgy.market/`}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:no-underline no-underline w-full"
                >
                  <div className="self-stretch rounded-lg [background:linear-gradient(10deg,_#1cc5de,_#c7ee89)]  h-12 flex flex-row items-center justify-center text-lg p-[1px]">
                    <div className="w-full h-full   rounded-lg [background:linear-gradient(115.04deg,_#101011,_#1d1d22_49.21%,_#0f1011)] flex flex-row items-center justify-center text-lg">
                      <div className="relative leading-[120.41%] text-transparent !bg-clip-text [background:linear-gradient(45deg,_#1cc5de,_#c7ee89)] [-webkit-background-clip:text] [-webkit-text-fill-color:transparent]">
                        View
                      </div>
                      <img
                        className="w-5 relative h-5 pl-1"
                        alt=""
                        src="/vuesaxlinearexport.svg"
                      />
                    </div>
                  </div>{" "}
                </a>
              </div>
              <div className="justify-end hidden md:flex font-gilroy-semibold w-full md:w-1/2 md:text-[52px] text-[42px] text-center md:text-right w-1/2 tracking-[-0.21px] leading-[120%] inline-block text-transparent !bg-clip-text [background:linear-gradient(45deg,_#1cc5de,_#c7ee89)] [-webkit-background-clip:text] [-webkit-text-fill-color:transparent] ">
                Documentation
              </div>
            </motion.div>
            <motion.div
              className="w-full flex flex-col md:flex-row items-center justify-between gap-4 text-5xl md:pt-16"
              initial="hidden"
              whileInView="visible" // Trigger animation when in view
              viewport={{ once: true, amount: 0.4 }} // Animate once, when 20% of the element is in view
              variants={fadeInUp} // Apply the fadeInUp variant
            >
              <div className="font-gilroy-semibold md:text-[52px] text-[42px] flex flex-col items-center justify-center tracking-[-0.21px] leading-[120%] inline-block text-transparent !bg-clip-text [background:linear-gradient(45deg,_#1cc5de,_#c7ee89)] [-webkit-background-clip:text] [-webkit-text-fill-color:transparent] ">
                <div className="m-0">Follow Us On X</div>
                {/* <div className="m-0">Join the Discord</div> */}
              </div>
              <div className="flex flex-row gap-8">
                <div className="flex flex-col items-center justify-center gap-4 text-lg">
                  <img
                    className="self-stretch relative h-[230px] rounded-2xl max-w-full overflow-hidden w-full shrink-0"
                    alt=""
                    src="/frame-20856603621.svg"
                  />
                  <a
                    href={`https://x.com/HedgyMarket`}
                    target="_blank"
                    rel="noreferrer"
                    className="hover:no-underline no-underline w-full"
                  >
                    <div className="self-stretch rounded-lg [background:linear-gradient(90.72deg,_rgba(73,_246,_255,_0.1),_rgba(98,_143,_255,_0.1))] border-aqua border-[2px] border-solid box-border h-12 flex flex-row items-center justify-center p-2">
                      <div className="relative leading-[120.41%] text-transparent !bg-clip-text [background:linear-gradient(90.72deg,_#49f6ff,_#628fff)] [-webkit-background-clip:text] [-webkit-text-fill-color:transparent]">
                        Follow
                      </div>
                    </div>{" "}
                  </a>
                </div>
                {/* <div className="flex flex-col items-start justify-start gap-4 text-lg">
                <img
                  className="self-stretch relative h-[230px] rounded-2xl max-w-full overflow-hidden w-full shrink-0"
                  alt=""
                  src="/frame-2085660363.svg"
                />
                                       <a
            href={`https://docs.hedgy.market/`}
            target="_blank"
            rel="noreferrer"
            className="hover:no-underline no-underline w-full"
          >
                <div className="self-stretch rounded-lg [background:linear-gradient(90.72deg,_rgba(143,_73,_255,_0.1),_rgba(203,_98,_255,_0.1))] border-blueviolet border-[2px] border-solid box-border h-12 flex flex-row items-center justify-center p-2">
                  <div className="relative leading-[120.41%] text-transparent !bg-clip-text [background:linear-gradient(90.72deg,_#8f49ff,_#cb62ff)] [-webkit-background-clip:text] [-webkit-text-fill-color:transparent]">
                    Join
                  </div>
                </div> </a>
              </div>{" "}  */}
              </div>
            </motion.div>
          </div>
        </div>
      </div>{" "}
    </>
  );
};
