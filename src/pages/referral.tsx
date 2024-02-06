import { FC, useState, useEffect, useCallback, useRef } from "react";
import Head from "next/head";
import {
  Connection,
  SystemProgram,
  Transaction,
  TransactionSignature,
  PublicKey,
  LAMPORTS_PER_SOL,
} from "@solana/web3.js";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { UserAccount } from "../out/accounts/UserAccount"; // Update with the correct path
import { AffiliateAccount } from "../out/accounts/AffiliateAccount";
import { initializeAffilAcc } from "../out/instructions/initializeAffilAcc"; // Update with the correct path
import { withdrawAffiliateEarnings } from "../out/instructions/withdrawAffiliateEarnings"; // Update with the correct path
import {
  initializeUserAcc,
  InitializeUserAccArgs,
  InitializeUserAccAccounts,
} from "../out/instructions/initializeUserAcc"; // Update with the correct path
import { PROGRAM_ID } from "../out/programId";
import { notify } from "utils/notifications";
import useUserSOLBalanceStore from "../../src/stores/useUserSOLBalanceStore";

async function doesUserhaveAffiliate(
  account: PublicKey,
  connection: Connection
): Promise<{
  hasCode: boolean;
  myAffiliate: Uint8Array;
  usedAffiliate: Uint8Array;
  isInt: boolean;
}> {
  const accountInfo = await connection.getAccountInfo(account);

  if (!accountInfo) {
    console.error("Account not found or not fetched properly.");
    return {
      hasCode: false,
      myAffiliate: new Uint8Array(8),
      usedAffiliate: new Uint8Array(8).fill(0),
      isInt: false,
    };
  }

  // Convert the buffer from Solana into a Buffer type that's used by Borsh
  const bufferData = Buffer.from(accountInfo.data);

  let userAccount;
  try {
    // Use the UserAccount class to decode the data
    userAccount = UserAccount.decode(bufferData);
  } catch (error) {
    console.error("Failed to decode user account data:", error);
    return {
      hasCode: false,
      myAffiliate: new Uint8Array(8),
      usedAffiliate: new Uint8Array(8).fill(0),
      isInt: false,
    };
  }

  const hasCode = userAccount.myAffiliate.some((value) => value !== 0);
  return {
    hasCode,
    myAffiliate: userAccount.myAffiliate,
    usedAffiliate: userAccount.usedAffiliate,
    isInt: userAccount.isInitialized,
  };
}

async function getAffiliateData(
  affiliatePublicKey: PublicKey,
  connection: Connection
): Promise<{ account: AffiliateAccount }> {
  const accountInfo = await connection.getAccountInfo(affiliatePublicKey);

  if (!accountInfo) {
    throw new Error("Account not found or not fetched properly.");
  }

  // Convert the buffer from Solana into a Buffer type that's used by Borsh
  const bufferData = Buffer.from(accountInfo.data);

  let affiliateAccount;
  try {
    // Use the AffiliateAccount class to decode the data
    affiliateAccount = AffiliateAccount.decode(bufferData);
  } catch (error) {
    console.error("Failed to decode affiliate account data:", error);
    throw error;
  }

  return {
    account: affiliateAccount.toJSON(),
  };
}

async function checkAffiliateInitialization(
  affiliatePublicKey: PublicKey,
  connection: Connection
): Promise<{ IsInitialized: boolean }> {
  const accountInfo = await connection.getAccountInfo(affiliatePublicKey);

  if (!accountInfo) {
    return { IsInitialized: false };
  }

  // Convert the buffer from Solana into a Buffer type that's used by Borsh
  const bufferData = Buffer.from(accountInfo.data);

  let affiliateAccount;
  try {
    // Use the AffiliateAccount class to decode the data
    affiliateAccount = AffiliateAccount.decode(bufferData);
  } catch (error) {
    console.error("Failed to decode affiliate account data:", error);
    throw error;
  }

  return {
    IsInitialized: affiliateAccount.isInitialized, // assuming isInitialized is a method
  };
}

function affiliateCodeToUint8Array(input: string): Uint8Array {
  const byteArray = new Uint8Array(8).fill(0);
  for (let i = 0; i < 8 && i < input.length; i++) {
    byteArray[i] = input.charCodeAt(i);
  }
  return byteArray;
}

const Referral: FC = () => {
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();

  const [affiliateCode, setAffiliateCode] = useState<string>("");
  const [userAffiliateData, setUserAffiliateData] = useState<{
    hasCode: boolean;
    myAffiliate: Uint8Array;
    usedAffiliate: Uint8Array;
    isInt: boolean;
  } | null>(null);
  const balance = useUserSOLBalanceStore((s) => s.balance);
  const { getUserSOLBalance } = useUserSOLBalanceStore();

  useEffect(() => {
    const fetchAffiliateStatus = async () => {
      if (!publicKey) {
        setUserAffiliateData(null); // Reset the userAffiliateData if publicKey is not defined
        return;
      }
      const seedsUser = [Buffer.from(publicKey.toBytes())];
      const [userAcc] = await PublicKey.findProgramAddress(
        seedsUser,
        PROGRAM_ID
      );

      // Check if the user has an affiliate code when the component mounts
      if (publicKey) {
        const result = await doesUserhaveAffiliate(userAcc, connection);
        setUserAffiliateData(result);
      }
    };

    fetchAffiliateStatus();
  }, [publicKey, connection]);

  const onClick = useCallback(async () => {
    // Create the instruction to initialize the user account
    if (!publicKey) {
      notify({
        type: "error",
        message: `Wallet not connected`,
        description: "Connect the wallet in the top panel",
      });
      return;
    }

    const seedsUser = [Buffer.from(publicKey.toBytes())];

    const [userAcc] = await PublicKey.findProgramAddress(seedsUser, PROGRAM_ID);

    const seedsAffil = [affiliateCodeToUint8Array(affiliateCode)];

    if (userAffiliateData && !userAffiliateData.isInt) {
      try {
        const seedsAffil = [userAffiliateData.usedAffiliate];

        const [AffilAcc] = await PublicKey.findProgramAddress(
          seedsAffil,
          PROGRAM_ID
        );

        const accounts: InitializeUserAccAccounts = {
          userAcc: userAcc,
          playerAcc: publicKey,
          affilAcc: AffilAcc,
          systemProgram: SystemProgram.programId,
          clock: new PublicKey("SysvarC1ock11111111111111111111111111111111"),
        };

        const args: InitializeUserAccArgs = {
          usedAffiliate: Array.from(userAffiliateData.usedAffiliate),
        };

        // Create a new transaction to initialize the user account and send it
        const initTransaction = new Transaction().add(
          initializeUserAcc(args, accounts)
        );
        const initSignature = await sendTransaction(
          initTransaction,
          connection
        );

        // Wait for transaction confirmation
        notify({ type: "info", message: `Trying to create Trading Account` });
        await connection.confirmTransaction(initSignature, "confirmed");
        setUserAffiliateData((prevState) => ({ ...prevState, hasCode: false }));
        setUserAffiliateData((prevState) => ({ ...prevState, isInt: true }));
        notify({
          type: "success",
          message: `Trading account created, now create the Referral.`,
          description: `Now create the Referral.`,

        });
      } catch (error) {
        notify({
          type: "error",
          message: `Creation Failed`,
          description: error?.message,
        });
      }
    } else {
      const [AffilAcc] = await PublicKey.findProgramAddress(
        seedsAffil,
        PROGRAM_ID
      );

      const result = await checkAffiliateInitialization(AffilAcc, connection);
      const IsInitialized = result.IsInitialized;

      if (IsInitialized) {
        notify({ type: "error", message: "Referral code is already used." });
      } else {
        const args = {
          affiliateCode: Array.from(affiliateCodeToUint8Array(affiliateCode)),
        };

        // Create the instruction to initialize the user account
        const accounts = {
          affilAcc: AffilAcc,
          userAcc: userAcc,
          playerAcc: publicKey,
          systemProgram: SystemProgram.programId,
          clock: new PublicKey("SysvarC1ock11111111111111111111111111111111"),
        };
        // Create a new transaction to initialize the user account and send it
        const initTransaction = new Transaction().add(
          initializeAffilAcc(args, accounts)
        );

        try {
          const initSignature = await sendTransaction(
            initTransaction,
            connection
          );
          // Notify user that the transaction was sent
          notify({
            type: "info",
            message: `Creating Referral Code`,
            txid: initSignature,
          });
          // Wait for transaction confirmation
          await connection.confirmTransaction(initSignature, "confirmed");
          setUserAffiliateData((prevState) => ({
            ...prevState,
            hasCode: true,
          }));
          setUserAffiliateData((prevState) => ({ ...prevState, isInt: true }));
          setUserAffiliateData((prevState) => ({
            ...prevState,
            myAffiliate: affiliateCodeToUint8Array(affiliateCode),
          }));
          notify({
            type: "success",
            message: `Your referral code has been created.`,
            txid: initSignature,
          });
        } catch (error: any) {
          // In case of an error, show only the 'error' notification
          notify({
            type: "error",
            message: `Referral code was not created`,
            description: error?.message,
          });
          return;
        }
      }
    }
  }, [
    userAffiliateData,
    affiliateCode,
    publicKey,
    connection,
    sendTransaction,
    notify,
  ]);

  const [decodedString, setDecodedString] = useState("");

  useEffect(() => {
    // Check if userAffiliateData exists and has the 'myAffiliate' property with a length greater than 0
    if (userAffiliateData && userAffiliateData.myAffiliate.length > 0) {
      const decoded = Array.from(userAffiliateData.myAffiliate)
        .filter((byte) => byte !== 0)
        .map((byte) => String.fromCharCode(byte))
        .join("");
      setDecodedString(decoded);
    } else {
      setDecodedString("");
    }
  }, [userAffiliateData]);

  const [affiliateData, setAffiliateData] = useState<AffiliateAccount | null>(
    null
  );

  useEffect(() => {
    if (
      userAffiliateData?.myAffiliate &&
      userAffiliateData.myAffiliate.length > 0
    ) {
      const affiliateCodeByteArray = userAffiliateData.myAffiliate;
      // Your logic here to derive the affiliatePublicKey using the affiliateCodeByteArray
      // This could be similar to how you derived the 'AffilAcc' in the 'onClick' function.

      const fetchAffiliateData = async () => {
        const seedsAffil = [affiliateCodeByteArray];
        const [affiliatePublicKey] = await PublicKey.findProgramAddress(
          seedsAffil,
          PROGRAM_ID
        );
        try {
          const data = await getAffiliateData(affiliatePublicKey, connection);
          setAffiliateData(data.account);
        } catch (error) {
          console.error("Error fetching affiliate data:", error);
        }
      };

      fetchAffiliateData();
    }
  }, [userAffiliateData, connection]);

  const onClick1 = useCallback(async () => {
    // Create the instruction to initialize the user account
    if (affiliateData.totalEarned <= 0.1 * LAMPORTS_PER_SOL) {
      notify({
        type: "error",
        message: `Rewards are less than 0.1 SOL`,
        description: "Try again later.",
      });
      return;
    }
    if (!publicKey) {
      notify({
        type: "error",
        message: `Wallet not connected`,
        description: "Connect the wallet in the top panel",
      });
      return;
    }

    const seedsAffil = [userAffiliateData.myAffiliate];

    const [AffilAcc] = await PublicKey.findProgramAddress(
      seedsAffil,
      PROGRAM_ID
    );

    // Create the instruction to to withdrawaffilearnings
    const accounts = {
      affilAcc: AffilAcc,
      playerAcc: publicKey,
      pdaHouseAcc: new PublicKey(
        "3MRKR5tYQeUT8CXYkTjvzR6ivEpaqFLqK9CsNbMFvoHB"
      ),
      systemProgram: SystemProgram.programId,
    };
    // Create a new transaction to initialize the user account and send it
    const initTransaction = new Transaction().add(
      withdrawAffiliateEarnings(accounts)
    );

    try {
      const initSignature = await sendTransaction(initTransaction, connection);
      // Notify user that the transaction was sent
      notify({
        type: "info",
        message: `Trying to create the referral...`,
        txid: initSignature,
      });
      // Wait for transaction confirmation
      await connection.confirmTransaction(initSignature, "confirmed");
      notify({
        type: "success",
        message: `Your referral code has been created.`,
        txid: initSignature,
      });
      if (affiliateData) {
        const updatedAffiliateData = new AffiliateAccount({
          ...affiliateData,
          totalEarned: 0,
        });
        setAffiliateData(updatedAffiliateData);
      }
    } catch (error: any) {
      // In case of an error, show only the 'error' notification
      notify({
        type: "error",
        message: `Could not withdraw the Affiliate Earnings`,
        description: error?.message,
      });
      return;
    }
  }, [
    userAffiliateData,
    publicKey,
    connection,
    sendTransaction,
    notify,
    affiliateData,
  ]);

  const copyToClipboard = () => {
    if (decodedString) {
      // Check if decodedString is not empty
      navigator.clipboard
        .writeText(decodedString)
        .then(() => {
          console.log("Text copied to clipboard");
        })
        .catch((err) => {
          console.error("Failed to copy text to clipboard", err);
        });
    }
  };

  return (
    <div>
      <Head>
        <title>PopFi | Referral</title>
        <meta name="description" content="PopFi" />
      </Head>
      <div className="flex justify-center items-center md:pt-2 bg-base h-[calc(100vh-78px)]">
        <div className="w-[98%] xl:w-[60%] lg:w-[60%] md:w-[60%] sm:w-full lg:min-w-[700px] md:min-w-[700px] h-full px-2">
          <h1 className="bankGothic md:text-start text-center text-4xl pt-4 lg:text-5xl text-transparent bg-clip-text bg-white">
            Referral System
          </h1>
          <img
            className="hidden md:block absolute h-[39.41%] w-[21.83%] top-[12.12%] bottom-[48.47%] right-[5%] max-w-full overflow-hidden max-h-full"
            alt=""
            src="/sheesh/donut3.svg"
          />
          {!userAffiliateData?.hasCode ? (
            <div className="pt-2 flex md:flex-row flex-col items-center justify-center gap-[16px] text-xl text-white z-100">
              <div className="md:w-[35%] w-full self-stretch bg-gradient-to-t from-[#0B7A55] to-[#34C796] md:rounded-2xl rounded-lg p-[1px] ">
                <div className="w-full h-full self-stretch md:rounded-2xl rounded-lg bg-gradient-to-t from-[#0B7A55] to-[#0b111b]  w-full flex flex-col items-start justify-center">
                  <div className="bg-base bg-opacity-70 w-full h-full self-stretch md:rounded-2xl rounded-lg  w-full flex flex-col items-start justify-center md:p-8 p-4  gap-[12px]">
                    <div className="bankGothic relative leading-[100%] font-medium bg-gradient-to-t from-[#0B7A55] to-[#34C796] [-webkit-background-clip:text] [-webkit-text-fill-color:transparent]">
                      HOW IT WORKS
                    </div>
                    <div className="font-poppins relative text-sm leading-[130%] text-white flex items-center w-full">
                      Refer friends to trade on PopFi and earn a share of their
                      trading fees!{" "}
                    </div>
                  </div>
                </div>
              </div>
              <div className="z-10 self-stretch md:rounded-2xl rounded-lg bg-layer-1 box-border md:w-[65%] w-full flex flex-col items-start justify-center md:p-8 p-4 gap-[12px] text-grey-text border-[1px] border-solid border-layer-3">
                <div className="pb-2 md:pb-2 bankGothic relative leading-[100%] font-medium">
                  CREATE PROMO CODE
                </div>
                <div className="self-stretch flex md:flex-row flex-col items-end justify-start gap-[16px] text-base text-grey font-poppins">
                  <div className="w-full md:h-10 h-8  rounded-lg bg-layer-2 border border-layer-3 px-2">
                    <input
                      type="text"
                      className="w-full h-full input3-capsule__input relative leading-[14px] "
                      id="affiliateCode"
                      value={affiliateCode}
                      onChange={(e) => setAffiliateCode(e.target.value)}
                      maxLength={8}
                      placeholder="Enter 8 letters"
                    />
                  </div>
                  <div className="rounded-lg bg-gradient-to-t from-[#0B7A55] to-[#34C796] p-[1px] md:w-1/4 w-full h-10   box-border text-center text-lg">
                    <button
                      onClick={onClick}
                      className="font-poppins flex flex-row items-center justify-center bg-[#0B111B] bg-opacity-80 hover:bg-opacity-60 h-full w-full py-3 px-6 relative font-semibold rounded-lg"
                    >
                      <button className="font-semibold bg-clip-text text-transparent bg-gradient-to-t from-[#34C796] to-[#0B7A55]">
                        CREATE
                      </button>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="z-10 pt-2 flex md:flex-row flex-col items-center justify-center gap-[16px] text-white px-2 md:px-0">
              <div className="z-10 md:w-[35%] self-stretch bg-gradient-to-t from-[#0B7A55] to-[#34C796] md:rounded-2xl rounded-lg p-[1px]">
                <div className="w-full h-full self-stretch md:rounded-2xl rounded-lg bg-gradient-to-t from-[#0B7A55] to-[#0b111b]  w-full flex flex-col items-start justify-center">
                  <div className="flex items-center justify-center bg-base bg-opacity-70 w-full h-full self-stretch md:rounded-2xl rounded-lg  w-full flex flex-col items-start justify-center md:p-8 p-4  gap-[12px]">
                    <div className="bankGothic font-medium text-grey-text relative leading-[100%] text-center">
                      YOUR REFERRAL CODE
                    </div>
                    <div className="flex flex-col items-center justify-center text-right text-13xl text-white font-poppins">
                      <div className="flex flex-row items-center  justify-center gap-[8px]">
                        <div className="text-3xl relative leading-[100%] font-medium">
                          {decodedString}
                        </div>
                        <button>
                          <img
                            onClick={copyToClipboard}
                            className="relative w-6 h-6"
                            alt=""
                            src="/sheesh/vuesaxlinearcopy.svg"
                          />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className=" z-10 md:w-[65%] w-full md:rounded-2xl rounded-lg bg-layer-1 flex flex-row items-center justify-start p-4 md:p-8 gap-[32px] text-sm border-[1px] border-solid border-layer-3">
                <div className="font-poppins w-[287px] flex flex-col items-start justify-center gap-[32px]">
                  <div className="flex flex-row items-center justify-start gap-[12px]">
                    <img
                      className="relative rounded-lg w-[42px] h-[42px]"
                      alt=""
                      src="/sheesh/icons12.svg"
                    />
                    <div className="flex flex-col items-start justify-center gap-[4px]">
                      <div className="text-grey-text relative leading-[100%] ">
                        TOTAL USERS
                      </div>
                      <div className="relative text-xl leading-[100%] font-medium font-poppins text-white text-right">
                        {affiliateData?.totalAffiliatesUsers}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-row items-center justify-start gap-[12px]">
                    <img
                      className="relative rounded-lg w-[42px] h-[42px]"
                      alt=""
                      src="/sheesh/icons13.svg"
                    />
                    <div className=" flex flex-col items-start justify-center gap-[4px]">
                      <div className="text-grey-text relative leading-[100%] ">
                        TO CLAIM
                      </div>
                      <div className="text-start relative text-xl leading-[100%] font-medium font-poppins text-white text-right">
                        {(
                          affiliateData?.totalEarned / LAMPORTS_PER_SOL
                        ).toFixed(2)}{" "}
                        SOL
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-start justify-center gap-[32px]">
                  <div className="flex flex-row items-center justify-start gap-[12px]">
                    <img
                      className="relative rounded-lg w-[42px] h-[42px]"
                      alt=""
                      src="/sheesh/icons2.svg"
                    />
                    <div className="flex flex-col items-start justify-center gap-[4px]">
                      <div className="text-grey-text text-grey-textrelative leading-[100%] ">
                        TOTAL VOLUME
                      </div>
                      <div className="relative text-xl leading-[100%] font-medium font-poppins text-white text-right">
                        {(
                          affiliateData?.totalAffiliatesVolume /
                          LAMPORTS_PER_SOL
                        ).toFixed(1)}
                      </div>
                    </div>
                  </div>
                  <div className="rounded-lg bg-gradient-to-t from-[#0B7A55] to-[#34C796] p-[1px] w-full w-full h-10   box-border text-center text-lg">
                    <button
                      onClick={onClick1}
                      className="font-poppins flex flex-row items-center justify-center bg-[#0B111B] bg-opacity-80 hover:bg-opacity-60 h-full w-full py-3 px-6 relative font-semibold rounded-lg"
                    >
                      <button className="font-semibold bg-clip-text text-transparent bg-gradient-to-t from-[#34C796] to-[#0B7A55]">
                        CLAIM
                      </button>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Referral;
