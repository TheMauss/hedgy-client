// /pages/api/check-participant.ts
import type { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";

const { APIKEYTEAM, BACKEND_URL } = process.env;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  const { publicKey, nickname } = req.body;

  try {
    // Make a request to your backend to set the nickname
    const response = await axios.post(
      `${BACKEND_URL}/api/set-nickname`, // Backend URL from environment
      { publicKey, nickname },
      {
        headers: {
          "x-api-key": APIKEYTEAM, // API key from environment
        },
      }
    );

    // Forward the response from the backend to the frontend
    res.status(200).json(response.data);
  } catch (error: any) {
    console.error("Error setting participant nickname:", error);
    res.status(500).json({
      message: "Error setting participant nickname",
      error: error.message,
    });
  }
}
