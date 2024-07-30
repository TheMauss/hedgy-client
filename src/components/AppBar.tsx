import { FC, useEffect, useState, useRef } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useAutoConnect } from "../contexts/AutoConnectProvider";
import NavElement from "./nav-element";
import useUserSOLBalanceStore from "../../src/stores/useUserSOLBalanceStore";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import Modal from "react-modal";
import { cn } from "../utils";
import { useRouter } from "next/router";
import { FaPaste, FaCoins, FaUsers, FaUser } from "react-icons/fa";
import { FaVault } from "react-icons/fa6";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";

const WalletMultiButtonDynamic = dynamic(
  async () =>
    (await import("@solana/wallet-adapter-react-ui")).WalletMultiButton,
  { ssr: false }
);

interface Props {
  isNavOpen: boolean;
  setIsNavOpen: (isOpen: boolean) => void; // if you are using useState, this would be the correct type for the setter.
}

export const AppBar: React.FC<Props> = ({ isNavOpen, setIsNavOpen }) => {
  const { autoConnect, setAutoConnect } = useAutoConnect();
  const [isMobile, setIsMobile] = useState(false);
  const [isMediumScreen, setIsMediumScreen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const divRef = useRef<HTMLDivElement | null>(null);

  const dropdownRef = useRef(null);
  const navRef = useRef(null);
  const [modalIsOpen, setModalIsOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      const windowWidth = window.innerWidth;
      setIsMobile(windowWidth <= 768);
      setIsMediumScreen(windowWidth > 768 && windowWidth <= 950);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const router = useRouter();
  const activeRoutes = ["/referralnew", "/vaultnew"]; // add as many routes as you want
  const isActiveButton = activeRoutes.includes(router.asPath);

  useEffect(() => {
    if (divRef.current) {
      divRef.current.className = cn(
        "h-0.5 w-1/4 transition-all duration-300 ease-out",
        isActiveButton
          ? "!w-full bg-gradient-to-l from-[#34C796] to-[#0b7a55]"
          : "group-hover:w-1/2 group-hover:bg-gradient-to-l from-[#34C796] to-[#0b7a55]"
      );
    }
  }, [isActiveButton]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("click", handleClickOutside); // change here

    return () => {
      document.removeEventListener("click", handleClickOutside); // change here
    };
  }, []);

  const wallet = useWallet();
  const { connection } = useConnection();
  const balance = useUserSOLBalanceStore((s) => s.solBalance);
  const { getUserSOLBalance, subscribeToBalanceChanges } =
    useUserSOLBalanceStore();

  useEffect(() => {
    if (wallet.publicKey) {
      subscribeToBalanceChanges(wallet.publicKey, connection);
    }
  }, [
    wallet.publicKey,
    connection,
    getUserSOLBalance,
    subscribeToBalanceChanges,
  ]);

  const { connected } = useWallet();

  const [position, setPosition] = useState({ top: "0px", left: "0px" });

  return (
    <div className="Gilroy-Semibold py-8 flex justify-center bg-layer-1">
      <div className="h-9.5 flex flex-row justify-between items-center w-[95%] xl:w-[80%] lg:w-[80%] md:w-[80%] sm:min-w-[95%]">
        <div className="flex flex-row items-center justify-start gap-[7.4px]">
          <img
            className="ml-1 w-[27.2px] relative h-[29.2px]"
            alt=""
            src="/group-1.svg"
          />
          <div className="text-[22px] text-white justify-center items-start tracking-[-0.01em] leading-[120.41%] inline-block shrink-0 pt-0.5">
            Stakera
          </div>
        </div>
        <div className="rounded-lg bg-bg h-[38px] overflow-hidden flex flex-row items-center justify-center box-border gap-[8px] text-base font-gilroy-semibold">
          <div className="flex items-center rounded-xl md:h-9 h-8 hover:bg-new-green-dark transition ease-in-out duration-300">
            <WalletMultiButton
              className="box-border flex flex-row items-center justify-center "
              style={{
                width: "100%",
                height: 40,
                backgroundColor: "transparent",
                color: "black",
              }}
            >
              {" "}
              {connected ? (
                <div className="Gilroy-Medium text-white w-full flex flex-col h-full items-center justify-center text-[16px]">
                  <div className="h-1/3 text-[10px] w-full">
                    {wallet.publicKey.toBase58().slice(0, 3)}...
                    {wallet.publicKey.toBase58().slice(-3)}
                  </div>
                  <div className=" text-[13px]">
                    {(balance || 0).toLocaleString("en-US", {
                      useGrouping: false,
                    })}{" "}
                    SOL
                  </div>
                </div>
              ) : (
                <div className="text-white">CONNECT</div>
              )}
            </WalletMultiButton>
          </div>
          {/* <div className=" ">
        r34...231
      </div> */}
        </div>
      </div>{" "}
    </div>
  );
};

export default AppBar;
