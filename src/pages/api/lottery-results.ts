// /pages/api/lottery-results.ts
import type { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { APIKEY, BACKEND_SOCKET } = process.env; // Access your API key from environment variables

  try {
    const response = await axios.get(`${BACKEND_SOCKET}/lottery-results`, {
      headers: {
        "x-api-key": APIKEY, // Add the API key to the headers
      },
    });

    const { smallResults, bigResults } = response.data;

    // Send the results to the client
    res.status(200).json({ smallResults, bigResults });
  } catch (error) {
    console.error("Error fetching lottery results:", error);
    res.status(500).json({ error: "Error fetching lottery results" });
  }
}
