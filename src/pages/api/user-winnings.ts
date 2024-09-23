// /pages/api/user-winnings.ts
import type { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { publicKey } = req.query; // Get publicKey from query parameters
  const { APIKEY, BACKEND_SOCKET } = process.env; // Access your API key from environment variables

  if (!publicKey) {
    res.status(400).json({ error: "Public key is required" });
    return;
  }

  try {
    const response = await axios.get(
      `${BACKEND_SOCKET}/user-winnings/${publicKey}`,
      {
        headers: {
          "x-api-key": APIKEY, // Add the API key to the headers
        },
      }
    );

    const userWinn = response.data;

    // Send the user winnings to the client
    res.status(200).json(userWinn);
  } catch (error) {
    console.error("Error fetching user winnings:", error);
    res.status(500).json({ error: "Error fetching user winnings" });
  }
}
