import { FC, useEffect, useState, useRef } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useAutoConnect } from "../contexts/AutoConnectProvider";
import NetworkSwitcher from "./NetworkSwitcher";
import { useFastTrade } from "../contexts/FastTradeContext";
import NavElement from "./nav-element";
import useUserSOLBalanceStore from "../../src/stores/useUserSOLBalanceStore";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import Modal from "react-modal";
import { cn } from "../utils";
import { useRouter } from "next/router";
import { FaPaste, FaCoins, FaUsers, FaUser } from "react-icons/fa";
import { FaVault } from "react-icons/fa6";
import { useVisibility } from "components/VisibilityContext";

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
  const { fastTradeActivated, setFastTradeActivated } = useFastTrade();
  const { isVisible, setIsVisible } = useVisibility();

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
  const [closeTimeout, setCloseTimeout] = useState(null);
  const modalRef = useRef(null);
  const [mouseInsideButton, setMouseInsideButton] = useState(false);
  const buttonRef = useRef(null);

  const handleMouseLeave = (event) => {
    // We will delay the evaluation and then check
    setTimeout(() => {
      const relatedTarget = event.relatedTarget;

      // If relatedTarget is not a Node, close the modal
      if (!(relatedTarget instanceof Node)) {
        setModalIsOpen(false);
        return;
      }

      // If the relatedTarget is the modal, then do not close the modal
      if (modalRef.current && modalRef.current.contains(relatedTarget)) {
        return;
      }

      // If the relatedTarget is outside both the button and the modal, close the modal
      if (
        modalRef.current &&
        buttonRef.current &&
        !modalRef.current.contains(relatedTarget) &&
        !buttonRef.current.contains(relatedTarget)
      ) {
        setModalIsOpen(false);
      }
    }, 50); // Small delay to let the relatedTarget update if moving to the modal
  };

  const handleMouseEnterModal = () => {
    // Clear the timeout to keep the modal open.
    if (closeTimeout) {
      clearTimeout(closeTimeout);
      setCloseTimeout(null);
    }
  };

  const handleMouseEnterButton = () => {
    const rect = buttonRef.current.getBoundingClientRect();

    setPosition({
      top: `${rect.bottom}px`,
      left: `${rect.left}px`,
    });
    // If the mouse re-enters the modal or button before the delay, we clear the timeout
    if (closeTimeout) {
      clearTimeout(closeTimeout);
    }
    // Assuming you want the modal to stay open when the mouse re-enters
    setModalIsOpen(true);
  };

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

  const ModalDetails1 = (
    <Modal
      className="custom-scrollbar"
      isOpen={modalIsOpen}
      onMouseLeave={handleMouseLeave}
      onRequestClose={() => setModalIsOpen(false)}
      style={{
        overlay: {
          backgroundColor: "transparent",
        },
        content: {
          backgroundSize: "cover",
          width: "160px",
          height: "90px",
          position: "fixed",
          top: position.top,
          left: position.left,
          transform: "translateY(0)",
          border: "none",
          outline: "none",
        },
      }}
    >
      <div
        ref={modalRef}
        onMouseEnter={handleMouseEnterModal}
        onMouseLeave={handleMouseLeave}
      >
        <div className="w-[160px] h-[90px] bg-[#080808] text-slate-300 p-2 gap-y-2 rounded">
          <div className="h-[50%] w-full flex flex-row justify-start items-left">
            <div className="h-[100%] w-[100%]">
              <NavElement
                icon={<FaUsers size="1.5rem" className="mr-1" />}
                label="Referral"
                href="/referral"
                navigationStarts={() => setIsNavOpen(false)}
              />
            </div>
          </div>
          <div className="h-[50%] w-full flex flex-row justify-start items-left text-start">
            <div className="h-[100%] w-[100%]">
              <NavElement
                icon={<FaVault size="1.3rem" className="" />}
                label="Vault"
                href="/vault"
                navigationStarts={() => setIsNavOpen(false)}
              />
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );

  return (
    <div
      ref={navRef}
      className={`flex items-center justify-center h-[55px] flex-row bg-[#ffffff08] text-[#E0E5EA] ${isVisible ? "blur-behind-modal" : ""}`}
    >
      <div className="flex items-center justify-between w-[90%]">
        <div className="flex items-center">
          {!isMobile && (
            <div className="flex justify-center items-center">
              <Link href="/">
                <div>
                  <img
                    src="/popfismall.png"
                    alt="Logo"
                    className="w-[48px] h-[48px]"
                  />
                </div>
              </Link>
            </div>
          )}
          {isMobile ? (
            // Code for Mobile

            <div className="flex items-center bg-primary rounded-xl h-9 hover:bg-new-green-dark transition ease-in-out duration-300">
              <WalletMultiButtonDynamic
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
                  <div className="text-black w-full flex flex-col h-full items-center justify-center text-[16px]">
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
                  <div className="text-black">CONNECT</div>
                )}
              </WalletMultiButtonDynamic>
            </div>
          ) : (
            <>
              {!isMediumScreen && (
                // Code for Large Screens
                <>
                  <span className=" mx-0.5 z-10"></span>
                  {/* <NavElement
                    label="Options"
                    href="/trade"
                    navigationStarts={() => setIsNavOpen(false)}
                  /> */}
                  <span className="mx-0.5 z-10"></span>
                  <NavElement
                    label="Futures"
                    href="/futures"
                    navigationStarts={() => setIsNavOpen(false)}
                  />
                  <span className="mx-0.5 z-10"></span>
                  <NavElement
                    label="Stats"
                    href="/stats"
                    navigationStarts={() => setIsNavOpen(false)}
                  />
                  <span className="mx-0.5 z-10"></span>

                  <NavElement
                    label="Vault"
                    href="/vault"
                    navigationStarts={() => setIsNavOpen(false)}
                  />
                </>
              )}
              {isMediumScreen && (
                // Code for Regular Screens (not Medium)
                <div className="flex items-center ">
                  <>
                    <span className=" mx-0.5 z-10"></span>
                    {/* <NavElement
                      label="Options"
                      href="/trade"
                      navigationStarts={() => setIsNavOpen(false)}
                    /> */}
                    <span className="mx-0.5 z-10"></span>
                    <NavElement
                      label="Futures"
                      href="/futures"
                      navigationStarts={() => setIsNavOpen(false)}
                    />
                    <span className="mx-0.5 z-10"></span>
                    <NavElement
                      label="Stats"
                      href="/stats"
                      navigationStarts={() => setIsNavOpen(false)}
                    />
                    <span className="mx-0.5 z-10"></span>

                    <NavElement
                      label="Vault"
                      href="/vault"
                      navigationStarts={() => setIsNavOpen(false)}
                    />
                  </>
                </div>
              )}
            </>
          )}
        </div>

        <div className=" -end flex items-center">
          {!isMobile && !isMediumScreen && (
            <div className="hidden md:inline-flex align-items-center justify-items relative items-center text-lg">
              <Link href="/profile">
                <FaUser className="mr-2 text-[#ffffff24] hover:text-[#23EAA4] text-xl transition-all duration-200 ease-in-out" />
              </Link>
              <div className="flex items-center bg-primary rounded-xl h-9 hover:bg-new-green-dark transition ease-in-out duration-300">
                <WalletMultiButtonDynamic
                  className="box-border flex flex-row items-center justify-center "
                  style={{
                    width: "100%",
                    height: 40,
                    backgroundColor: "transparent",
                    color: "black",
                  }}
                >
                  {connected ? (
                    <div className="text-black w-full flex flex-col h-full items-center justify-center text-[16px]">
                      <div className="h-1/3 text-[10px] w-full">
                        {wallet.publicKey.toBase58().slice(0, 3)}...
                        {wallet.publicKey.toBase58().slice(-3)}
                      </div>
                      <div className=" text-[13px] w-full">
                        {(balance || 0).toLocaleString("en-US", {
                          useGrouping: false,
                        })}{" "}
                        SOL
                      </div>
                    </div>
                  ) : (
                    <div className="text-black flex items-center justify-center w-full h-full">
                      CONNECT
                    </div>
                  )}
                </WalletMultiButtonDynamic>{" "}
              </div>
            </div>
          )}
          {isMobile && (
            <>
              <label
                htmlFor="my-drawer"
                className="btn-gh items-center justify-between md:hidden relative"
                onClick={() => setIsNavOpen(!isNavOpen)}
              >
                <div className="HAMBURGER-ICON space-y-2.5">
                  <div className="h-0.5 w-8 bg-gradient-to-tr from-grey-text to-white" />
                  <div className="h-0.5 w-8 bg-gradient-to-tr from-grey-text to-white" />
                  <div className="h-0.5 w-8 bg-gradient-to-tr from-grey-text to-white" />
                </div>
              </label>
            </>
          )}
          {isMediumScreen && (
            <div className=" flex items-center ml-auto">
              <Link href="/profile">
                <FaUser className="mr-2 text-[#ffffff24] hover:text-[#23EAA4] text-xl transition-all duration-200 ease-in-out" />
              </Link>
              <div className="flex items-center bg-primary rounded-xl h-9 hover:bg-new-green-dark transition ease-in-out duration-300">
                <WalletMultiButtonDynamic
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
                    <div className="text-black w-full flex flex-col h-full items-start justify-center text-[15px]">
                      <div className="h-1/2 text-[10px]">
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
                    <div className="text-black">CONNECT</div>
                  )}
                </WalletMultiButtonDynamic>{" "}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AppBar;
