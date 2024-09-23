// /pages/api/top-teams.ts
import type { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";

const { APIKEYTEAM, BACKEND_URL } = process.env; // Replace this with the key from environment variables

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  try {
    const response = await axios.get(`${BACKEND_URL}/api/top-teams`, {
      headers: {
        "x-api-key": APIKEYTEAM,
      },
    });

    res.status(200).json(response.data);
  } catch (error) {
    console.error("Error fetching top teams:", error);
    res.status(500).json({ message: "Error fetching top teams" });
  }
}
