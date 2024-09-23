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

  const { publicKey } = req.body;

  try {
    const response = await axios.post(
      `${BACKEND_URL}/api/check-participant`, // Use the backend URL from your environment
      { publicKey },
      {
        headers: {
          "x-api-key": APIKEYTEAM, // Use the API key securely
        },
      }
    );

    res.status(200).json(response.data);
  } catch (error) {
    console.error("Error fetching participant data:", error);
    res.status(500).json({ message: "Error fetching participant data" });
  }
}
