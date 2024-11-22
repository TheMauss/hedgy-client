// utils/checkAccess.ts
import { PublicKey } from "@solana/web3.js";

export async function hasAccess(publicKey: PublicKey | null): Promise<boolean> {
  if (!publicKey) return false;

  // Example: Check access from a list or API
  const allowedPublicKeys = [
    "Gk2K3kn4F33xCmSDUTFAAuMGaTXPQyXa5UNDwwf4983o",
    "2TL1HdsbhnD1B26cHUxvyDRvSUfXRVzrjByWuHHWGncY",
    "BmAbavJ1ALLhBK6YSNqyQe1faTpUDft7fyuX2ivPJMDf",
    "3wW9tDGp89LHLWS6Rf9aGKwm9wY5WYX97wcpGg53ryzq",
    "FpwixEFk4P2rYb41J9cW9r5Kj9x8qPUU715BHtyzyiHC",
    "9pByYH3Vrxybo2R69JY4Ywib6fwvVJK9e5y6iL3gN5TG",
    "AhSqJzyMwkftEFNQEiFXenbVu75XNY4pwRjScJuTRL53",
    "6LsscaTrb5E18UAxVzRGM3AyTS9ERw6LiJB2KDxq23hD",
    "3BXY7AT5gzSfm4u3VgAtwDtDePLYUggwEJnaFb52qbhz",
    "3gir3tVNCnz2DKJ1KGvCeTLCkDE8YpS3v7FjYMxuxnco",
    "f3SmNbpg7jjVzVhEdKiGDxRSeGVyRHArrStVYAC6Dkx",
    "Geo2ew4fJ9GvdX86hVbJwbnsM1ATYRXHSGkW89ArhL96",
    "BMgXvXgnffLY1eXjZQawGUZSnXE15ppcbyGzC6U8CbP5",
    "DPRZYAG2GnCkUW6EM6cZzCqsqQ8z8MZMNQqSH7FEktBm",
    "7QzbnMwoj6ZH8MaxeTcUdW2D1ri3t6bRTMfXzk8Jzc1H",
    "3QdpAwHxgyvPUBXV3GoG5w11NXqNu6a3xYHascuciXrU",
    "5yZTXDaCBrW8M4usDp3fTzBvccq1w91fFjjnwjRC9YYP",
    "BCrRSS9zeniVuEZ1n1z1pCWfdRoRDSxqmbaNQzeb2uoB",
    "EqK4PyJrL5UiAGD6t4DJQiswYCRnZaxuchMMLsDbw5Q1",
    "EtEfhjYKkcXdwGWC17RacQsoTTFPuT1KFrJWLa1UQMn",
    "AGExnEMV4VU3zHPmkK6zmwuQNjqpgPe5KffXACNLsgx4",
    "FiUrCxCuKSnbU9LwLZiJrspoXNiDAguSCe24RR6wDBht",
    "FipD7y7cPXhmXtQorVy2x94wQx4Ay1DKz6u9byjtc2E3",
    "AYXk1FGbEEZbkhT6Cy5Y4jWUbruSh5boEm1TrLSyayeq",
    "HG5SYPLJuD9xT2vdGBwzCoYCVfVs2jJFtc8BLt1J6nY8",
    "CwyRvrKUK9yfu7avTx9xyedhnJ7AcpRR6Ejm9gR9uXaw",
    "neucbePrpmpihXXwqNaESsKp5yLLny2pnWht9dcvwF4",
    "7kEKEvtKP2Avkk7W5zqFNHGH4GuuPP14sTLRJPzqfyE7",
    "GGLvbNFj1tbpjPs8dPE3ewEakoU6bR5AD79ppDcXBTza",
    "Gg6ut4qC12evz8v9iv8zNReEevTx9ZVxtLFbv25gq4w3",
    "FCHdEP1XRgqc7eFqYzkRk2KW83okcyybqRE5rgS2UiM7",
    "fpdDL7DCWsVwVbTRwZBtzXuPFwzps4v2chFKyFQ41d2",
    "DHF7q82aW4g462xRKdwne92KwRJ5nG6P1FePCXPvSAiM",
    "CgPSggQszWvP2Yx9KTinEaY8oof2FgWPEavKgR5eQJUP",
  ];

  return allowedPublicKeys.includes(publicKey.toBase58());
}
