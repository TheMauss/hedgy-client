// /pages/api/team.ts

import type { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";

const { APIKEYTEAM, BACKEND_URL } = process.env; // Load API key and backend URL from env variables

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  const { publicKey, teamName, action, usedReferralCode } = req.body;

  try {
    const response = await axios.post(
      `${BACKEND_URL}/api/team`, // Replace with your backend URL
      {
        publicKey,
        teamName,
        action,
        usedReferralCode,
      },
      {
        headers: {
          "x-api-key": APIKEYTEAM, // Use secure API key
        },
      }
    );

    res.status(200).json(response.data); // Pass the response back to the frontend
  } catch (error) {
    console.error("Error processing team request:", error);

    if (error.response) {
      res.status(error.response.status).json(error.response.data);
    } else {
      res.status(500).json({ message: "Internal server error" });
    }
  }
}
