import { FC, useState, useEffect, useCallback, useRef  } from "react";
import Head from "next/head";
import Link from 'next/link';
import { Connection, SystemProgram, Transaction, TransactionSignature, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { useAllowlist } from '../contexts/AllowlistContext'; 
import dynamic from 'next/dynamic';



const ENDPOINT = process.env.NEXT_PUBLIC_ENDPOINT6;
const ENDPOINT1 = process.env.NEXT_PUBLIC_ENDPOINT7;


const WalletMultiButtonDynamic = dynamic(
  async () => (await import('@solana/wallet-adapter-react-ui')).WalletMultiButton,
  { ssr: false }
);
  


const WhiteList: FC = () => {
  const { publicKey, connected } = useWallet();
  const { isAllowed, setIsAllowed } = useAllowlist();


  const [discord, setDiscord] = useState<string>("");
  const [isOnWhitelist , setIsOnWhitelist] = useState<string>("");

  const [isLoading, setIsLoading] = useState(false);

  const handleAddClick = async () => {
    if (publicKey && discord) {
      setIsLoading(true);

      try {
        const response = await fetch(ENDPOINT, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            publicKey: publicKey.toString(),
            discord,
          }),
        });

        if (response.ok) {
          // Update UI or show a success message
          console.log("Added to waitlist successfully!");
          setIsOnWhitelist("true");
        } else {
          // Handle error response from the server
          console.error("Error adding to waitlist:", response.statusText);
        }
      } catch (error) {
        console.error("Error adding to waitlist:", error);
      } finally {
        setIsLoading(false);

      }
    }
  };

  useEffect(() => {
    const checkIfAllowed = async () => {
      if (publicKey) {
        try {
          const response = await fetch(`${ENDPOINT1}/${publicKey.toString()}`);
          const data = await response.json();
          setIsAllowed(data.isAllowed);
          setIsOnWhitelist(data.isOnWhitelist); // Add this line to set isOnWhitelist
        } catch (error) {
          console.error('Error checking allowlist', error);
        }
      }
    };
  
    checkIfAllowed(); // Call the function to check both isAllowed and isOnWhitelist
  }, [publicKey, setIsAllowed, setIsOnWhitelist]);

    return (
        <div>
        <Head>
        <title>PopFi | Whitelist</title>
        <meta name="description" content="PopFi" />
        
      </Head>
        <div className="flex justify-center items-center md:pt-2 bg-base h-[calc(100vh-94px)]">
            <div className="w-[98%] xl:w-[60%] lg:w-[60%] md:w-[60%] sm:w-[60%] lg:min-w-[700px] md:min-w-[700px] h-full">
                
            <h1 className="bankGothic md:text-start text-center text-4xl pt-4 lg:text-5xl text-transparent bg-clip-text bg-white">
                    Whitelist
                </h1>
                <img
                                        className="hidden md:block absolute h-[39.41%] w-[21.83%] top-[12.12%] bottom-[48.47%] right-[5%] max-w-full overflow-hidden max-h-full"
                                                     alt=""
                                                 src="/sheesh/abstract06.svg"
                                                        />
                {!connected ? (

 <div className="pt-4 flex md:flex-row flex-col items-center justify-center gap-[16px] text-xl text-white px-2 md:px-0 z-100">

                        <div className="md:w-[35%] w-full self-stretch bg-gradient-to-t from-[#0B7A55] to-[#34C796] md:rounded-2xl rounded-lg p-[1px] ">
                      <div className="w-full h-full self-stretch md:rounded-2xl rounded-lg bg-gradient-to-t from-[#0B7A55] to-[#0b111b]  w-full flex flex-col items-start justify-center">
                        <div className="bg-base bg-opacity-70 w-full h-full self-stretch md:rounded-2xl rounded-lg  w-full flex flex-col items-start justify-center md:p-8 p-4  gap-[12px]">
                        <div className="bankGothic relative leading-[100%] font-medium bg-gradient-to-t from-[#0B7A55] to-[#34C796] [-webkit-background-clip:text] [-webkit-text-fill-color:transparent]">
                          HOW IT WORKS
                        </div>
                        <div className="font-poppins relative text-sm leading-[130%] text-white flex items-center w-full">
                        Connect your wallet and see if you are able to test our site.                      </div>
                      </div></div></div>
                      <div className="z-10 self-stretch md:rounded-2xl rounded-lg bg-layer-1 box-border md:w-[65%] w-full flex flex-col items-start justify-center md:p-8 p-4 gap-[12px] text-grey-text border-[1px] border-solid border-layer-3">
                        <div className="self-stretch flex md:flex-row flex-col items-end justify-start gap-[16px] text-base text-grey font-poppins">
                        <div className="rounded-lg bg-gradient-to-t from-[#0B7A55] to-[#34C796] p-[1px] w-full w-full   box-border text-center text-lg">
<button 
                    
                            className="w-full font-poppins flex flex-row items-center justify-center bg-[#0B111B] bg-opacity-80 hover:bg-opacity-60 h-full w-full  relative font-semibold rounded-lg">
                                <WalletMultiButtonDynamic className="flex justify-center items-center w-full font-semibold bg-clip-text text-transparent bg-gradient-to-t from-[#34C796] to-[#0B7A55]">
                          
                            </WalletMultiButtonDynamic></button>
                    </div>
                        </div>
                      </div>

                      
                    </div>
                ):(             isAllowed ? (
                  <div className="pt-4 flex md:flex-row flex-col items-center justify-center gap-[16px] text-xl text-white px-2 md:px-0 z-100">
                
                                        <div className="md:w-[35%] w-full self-stretch bg-gradient-to-t from-[#0B7A55] to-[#34C796] md:rounded-2xl rounded-lg p-[1px] ">
                                      <div className="w-full h-full self-stretch md:rounded-2xl rounded-lg bg-gradient-to-t from-[#0B7A55] to-[#0b111b]  w-full flex flex-col items-start justify-center">
                                        <div className="bg-base bg-opacity-70 w-full h-full self-stretch md:rounded-2xl rounded-lg  w-full flex flex-col items-start justify-center md:p-8 p-4  gap-[12px]">
                                        <div className="bankGothic relative leading-[100%] font-medium bg-gradient-to-t from-[#0B7A55] to-[#34C796] [-webkit-background-clip:text] [-webkit-text-fill-color:transparent]">
                                          HOW IT WORKS
                                        </div>
                                        <div className="font-poppins relative text-sm leading-[130%] text-white flex items-center w-full">
                                        Connect your wallet and see if you are able to test our site.                      </div>
                                      </div></div></div>
                                      <div className="z-10 self-stretch md:rounded-2xl rounded-lg bg-layer-1 box-border md:w-[65%] w-full flex flex-col items-start justify-center md:p-8 p-4 gap-[12px] text-grey-text border-[1px] border-solid border-layer-3">
                                        <div className="self-stretch flex md:flex-row flex-col items-center justify-center gap-[16px] text-base text-grey font-poppins">
                                        <div className="bankGothic relative leading-[100%] font-medium bg-gradient-to-t from-[#0B7A55] to-[#34C796] [-webkit-background-clip:text] [-webkit-text-fill-color:transparent]">
                                        You are whitelisted!                   </div><div className="rounded-lg bg-gradient-to-t from-[#0B7A55] to-[#34C796] p-[1px] w-full  w-full h-10   box-border text-center text-lg">
                            
                            <div 
                    
                            className="font-poppins flex flex-row items-center justify-center bg-[#0B111B] bg-opacity-80 hover:bg-opacity-60 h-full w-full  px-6 relative font-semibold rounded-lg">
                               <Link href="/futures"> <button 
                                
                                className="font-semibold bg-clip-text text-transparent bg-gradient-to-t from-[#34C796] to-[#0B7A55]">
                              TRY FUTURES
                            </button></Link></div>
                          </div>
                          <div className="rounded-lg bg-gradient-to-t from-[#0B7A55] to-[#34C796] p-[1px] w-full  w-full h-10   box-border text-center text-lg">
                            <div 
                    
                            className="font-poppins flex flex-row items-center justify-center bg-[#0B111B] bg-opacity-80 hover:bg-opacity-60 h-full w-full  px-6 relative font-semibold rounded-lg">
                                <Link href="/trade"><button 
                                
                                className="font-semibold bg-clip-text text-transparent bg-gradient-to-t from-[#34C796] to-[#0B7A55]">
                              TRY BINARIES
                            </button></Link></div>
                          </div>
                                        </div>
                                      </div>
                
                                      
                                    </div>
                ) : (  !isOnWhitelist ?(
                  <div className="pt-4 flex md:flex-row flex-col items-center justify-center gap-[16px] text-xl text-white px-2 md:px-0 z-100">
                
                                        <div className="md:w-[35%] w-full self-stretch bg-gradient-to-t from-[#0B7A55] to-[#34C796] md:rounded-2xl rounded-lg p-[1px] ">
                                      <div className="w-full h-full self-stretch md:rounded-2xl rounded-lg bg-gradient-to-t from-[#0B7A55] to-[#0b111b]  w-full flex flex-col items-start justify-center">
                                        <div className="bg-base bg-opacity-70 w-full h-full self-stretch md:rounded-2xl rounded-lg  w-full flex flex-col items-start justify-center md:p-8 p-4  gap-[12px]">
                                        <div className="bankGothic relative leading-[100%] font-medium bg-gradient-to-t from-[#0B7A55] to-[#34C796] [-webkit-background-clip:text] [-webkit-text-fill-color:transparent]">
                                          HOW IT WORKS
                                        </div>
                                        <div className="font-poppins relative text-sm leading-[130%] text-white flex items-center w-full">
                                        Connect your wallet and see if you are able to test our site.                             </div>
                                      </div></div></div>
                                      <div className="z-10 self-stretch md:rounded-2xl rounded-lg bg-layer-1 box-border md:w-[65%] w-full flex flex-col items-start justify-center md:p-8 p-4 gap-[12px] text-grey-text border-[1px] border-solid border-layer-3">
                                        <div className="pb-2 md:pb-2 bankGothic relative leading-[100%] font-medium">
                                          Add me on the Whitelist
                                        </div>
                                        <div className="self-stretch flex md:flex-row flex-col items-end justify-start gap-[16px] text-base text-grey font-poppins">

                                        <div className="w-full md:h-10 h-8  rounded-lg bg-layer-2 border border-layer-3 px-2">
                            <input type="text"        
                                         className="w-full h-full input3-capsule__input relative leading-[14px] "
                                     id="affiliateCode"
                                     value={discord}
                                     onChange={(e) => setDiscord(e.target.value)}
                                    maxLength={15}
                                    placeholder="Enter Discord" /></div>
                          <div className="rounded-lg bg-gradient-to-t from-[#0B7A55] to-[#34C796] p-[1px] md:w-1/4 w-full h-10   box-border text-center text-lg">
                            <div             onClick={handleAddClick}
          
                      
                            className="font-poppins flex flex-row items-center justify-center bg-[#0B111B] bg-opacity-80 hover:bg-opacity-60 h-full w-full py-3 px-6 relative font-semibold rounded-lg">
                                <button 
                                
                                className="font-semibold bg-clip-text text-transparent bg-gradient-to-t from-[#34C796] to-[#0B7A55]">
                              {isLoading ? "Adding..." : "ADD"}
                            </button></div>
                          </div></div>
                                      </div>
                
                                      
                                    </div>
                
                ):(   <div className="pt-4 flex md:flex-row flex-col items-center justify-center gap-[16px] text-xl text-white px-2 md:px-0 z-100">
                
                <div className="md:w-[35%] w-full self-stretch bg-gradient-to-t from-[#0B7A55] to-[#34C796] md:rounded-2xl rounded-lg p-[1px] ">
              <div className="w-full h-full self-stretch md:rounded-2xl rounded-lg bg-gradient-to-t from-[#0B7A55] to-[#0b111b]  w-full flex flex-col items-start justify-center">
                <div className="bg-base bg-opacity-70 w-full h-full self-stretch md:rounded-2xl rounded-lg  w-full flex flex-col items-start justify-center md:p-8 p-4  gap-[12px]">
                <div className="bankGothic relative leading-[100%] font-medium bg-gradient-to-t from-[#0B7A55] to-[#34C796] [-webkit-background-clip:text] [-webkit-text-fill-color:transparent]">
                  HOW IT WORKS
                </div>
                <div className="font-poppins relative text-sm leading-[130%] text-white flex items-center w-full">
                Connect your wallet and see if you are able to test our site.                             </div>
              </div></div></div>
              <div className="z-10 self-stretch md:rounded-2xl rounded-lg bg-layer-1 box-border md:w-[65%] w-full flex flex-col items-start justify-center md:p-8 p-4 gap-[12px] text-grey-text border-[1px] border-solid border-layer-3">
                <div className="bankGothic relative leading-[100%] font-medium">
                  Your are on the whitelist. You will receive your access soon.
                </div>
  
              </div>

              
            </div>
            ))
                

                )}



        </div>
        </div>
     </div>
        
    );
};

export default WhiteList;
