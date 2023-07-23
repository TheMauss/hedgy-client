import { FC, useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useAutoConnect } from '../contexts/AutoConnectProvider';
import NetworkSwitcher from './NetworkSwitcher';
import NavElement from './nav-element';
import useUserSOLBalanceStore from '../../src/stores/useUserSOLBalanceStore';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';

const WalletMultiButtonDynamic = dynamic(
  async () => (await import('@solana/wallet-adapter-react-ui')).WalletMultiButton,
  { ssr: false }
);


export const AppBar: FC = () => {
  const { autoConnect, setAutoConnect } = useAutoConnect();
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isMediumScreen, setIsMediumScreen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const dropdownRef = useRef(null);
  const navRef = useRef(null);

  useEffect(() => {
    const handleResize = () => {
      const windowWidth = window.innerWidth;
      setIsMobile(windowWidth <= 640);
      setIsMediumScreen(windowWidth > 640 && windowWidth <= 780);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);


  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current && !dropdownRef.current.contains(event.target)
      ) {
        setIsDropdownOpen(false);
      }
    };
  
    document.addEventListener('click', handleClickOutside);  // change here
  
    return () => {
      document.removeEventListener('click', handleClickOutside);  // change here
    };
  }, []);
  

  const wallet = useWallet();
  const { connection } = useConnection();
  const balance = useUserSOLBalanceStore((s) => s.balance);
  const { getUserSOLBalance, subscribeToBalanceChanges } = useUserSOLBalanceStore();

  useEffect(() => {
    if (wallet.publicKey) {
      console.log(wallet.publicKey.toBase58());
      subscribeToBalanceChanges(wallet.publicKey, connection);
    }
  }, [wallet.publicKey, connection, getUserSOLBalance, subscribeToBalanceChanges]);

  const toggleDropdownOpen = (e) => {
    e.stopPropagation();
    setIsDropdownOpen((prevState) => !prevState);
  };

  const handleDropdownClick = (e) => {
    e.preventDefault();  
    e.stopPropagation(); // prevent the click from triggering handleClickOutside
  };
  

  return (
    <div ref={navRef} className="navbar flex h-16 flex-row md:mb-2 shadow-lg bg-[#232332] text-[#E0E5EA] border-b border-zinc-600 bg-opacity-66 ">
      <div className="flex items-center justify-between w-full px-4 md:px-10">
        <div className="navbar-start flex items-center lg:ml-8 md:ml-8 sm:ml-8">
        {!isMobile && (
            <div className="flex-shrink-0 w-16 h-16 md:p-1 mr-2">
              <Link href="localhost:3000" target="_blank" rel="noopener noreferrer" passHref className="text-secondary hover:text-white">
                <img src="/logosmall.png" alt="Logo" width="80" height="80" />
              </Link>
            </div>
          )}
          {isMobile ? (
            // Code for Mobile

            <WalletMultiButtonDynamic className="text-[0.9rem] btn-ghost btn-sm rounded-full text-between-md-lg bg-gradient-to-tr from-[#EF4628] to-[#9845E1] animate-flow-color" />
            ) : (
    <>
      {!isMediumScreen && (
        // Code for Large Screens
        <>
          <NavElement
            label="Home"
            href="/"
            navigationStarts={() => setIsNavOpen(false)}
          />
          <span className="mx-2"></span>
          <NavElement
            label="Options"
            href="/trade"
            navigationStarts={() => setIsNavOpen(false)}
          />
                    <span className="mx-2"></span>
                              <NavElement
            label="Futures"
            href="/futures"
            navigationStarts={() => setIsNavOpen(false)}
          />
          <span className="mx-2"></span>
                    <NavElement
            label="Stats"
            href="/stats"
            navigationStarts={() => setIsNavOpen(false)}
          />
          
        </>
      )}
      {isMediumScreen && (
        // Code for Regular Screens (not Medium)
        <div className="flex items-center">
                  <>
          <NavElement
            label="Home"
            href="/"
            navigationStarts={() => setIsNavOpen(false)}
          />
          <span className="mx-2"></span>
          <NavElement
            label="Trade"
            href="/trade"
            navigationStarts={() => setIsNavOpen(false)}
          />
          <span className="mx-2"></span>
                              <NavElement
            label="Futures"
            href="/futures"
            navigationStarts={() => setIsNavOpen(false)}
          />
                    <span className="mx-2"></span>
                    <NavElement
            label="Stats"
            href="/stats"
            navigationStarts={() => setIsNavOpen(false)}
          />
                              <span className="mx-2"></span>
        </>
</div>
      )}
    </>
  )}
        </div>

        <div className="navbar-end flex items-center lg:mr-8 md:mr-8 mr-8">
  {!isMobile && !isMediumScreen && (
    <div className="hidden md:inline-flex align-items-center justify-items relative items-center text-lg">

      <div className="flex items-center">
      {wallet.connected && (
  <div className="flex items-center">
    <div className="mr-2 text-navbig">
      {(balance || 0).toLocaleString('en-US', { useGrouping: false })}
    </div>
    <div className="text-navbig font-semibold mr-2">
      SOL
    </div>
  </div>
)}
        <WalletMultiButtonDynamic className="text-[1rem] btn-ghost btn-sm rounded-full text-between-md-lg mr-6 bg-gradient-to-tr from-[#EF4628] to-[#9845E1] animate-flow-color" />
      </div>
      <span className="absolute block h-0.5 w-11 bg-zinc-600 rotate-90 right-[-17px] top-1/2 transform -translate-y-1/2"></span>
    </div>
  )}
{isMobile && (

  <>
    <label
      htmlFor="my-drawer"
      className="btn-gh items-center justify-between md:hidden"
      onClick={() => setIsNavOpen(!isNavOpen)}
    >
      <div className="HAMBURGER-ICON space-y-2.5">
        <div className={`h-0.5 w-8 bg-gradient-to-tr from-[#9c3fee] to-[#ef4628] ${isNavOpen ? 'hidden' : ''}`} />
        <div className={`h-0.5 w-8 bg-gradient-to-tr from-[#9c3fee] to-[#ef4628] ${isNavOpen ? 'hidden' : ''}`} />
        <div className={`h-0.5 w-8 bg-gradient-to-tr from-[#9c3fee] to-[#ef4628] ${isNavOpen ? 'hidden' : ''}`} />
      </div>
      <div
        className={`absolute block h-0.5 w-8 animate-pulse bg-gradient-to-tr from-[#EF4628] to-[#9845E1] ${
          isNavOpen ? '' : 'hidden'
        }`}
        style={{ transform: 'rotate(45deg)' }}
      />
      <div
        className={`absolute block h-0.5 w-8 animate-pulse bg-gradient-to-tr from-[#EF4628] to-[#9845E1] ${
          isNavOpen ? '' : 'hidden'
        }`}
        style={{ transform: 'rotate(135deg)' }}
      />
    </label>
  </>
)}
        {isMediumScreen && (
          <div className="flex items-center ml-auto">
        <WalletMultiButtonDynamic className="text-[1rem] btn-ghost btn-sm rounded-full text-between-md-lg bg-gradient-to-tr from-[#EF4628] to-[#9845E1] animate-flow-color" />
        <span className="absolute block h-0.5 w-11 bg-zinc-600 rotate-90 right-[-17px] top-1/2 transform -translate-y-1/2"></span>
          </div>
        )}

          {!isMobile && (
            <div className="dropdown dropdown-end" ref={dropdownRef}>
              <div
                tabIndex={0}
                className="btn btn-square btn-ghost text-right mr-4"
                onClick={toggleDropdownOpen}
                
              >
                <svg
                  className="w-7 h-7"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </div>
              {isDropdownOpen && (
                <ul className="p-2 shadow menu dropdown-content bg-[#1a1a25] border-2 border-gray-500 rounded-box sm:w-52 "
                onMouseDown={handleDropdownClick} onClick={handleDropdownClick}>
                  <li>
                    <div className="form-control bg-opacity-100">
                      <label className="cursor-pointer label">
                      <div className="w-full text-slate-300 font-semibold mt-2 relative">
                      Autoconnect</div>
                        <input
                          type="checkbox"
                          checked={autoConnect}
                          onChange={(e) => setAutoConnect(e.target.checked)}
                          className="toggle"
                        />
                      </label>
                      <NetworkSwitcher />
                    </div>
                  </li>
                </ul>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};