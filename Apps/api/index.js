import express from "express";
import axios from "axios";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

const BASE_URL = process.env.BASE_URL;
const API_KEY = process.env.API_KEY;

if (!BASE_URL || !API_KEY) {
  console.error("BASE_URL or API_KEY is not defined. Check your .env file.");
}

const URL = `${BASE_URL}${API_KEY}`;

app.use(
  cors({
    origin: "http://localhost:5173",
    methods: ["POST"],
    credentials: true,
  }),
);

app.use(express.json());

app.post("/api/generate", async (req, res) => {
  try {
    const { payloadQuery } = req.body;

    const payload = {
      contents: [
        {
          parts: [
            {
              text: payloadQuery,
            },
          ],
        },
      ],
    };

    const response = await axios.post(URL, payload, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    const dataString =
      response.data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "No response";

    res.json({ result: dataString });
  } catch (error) {
    console.error("Backend Error Details:", {
      message: error.message,
      code: error.code,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
    });
    res.status(500).json({
      error: "Something went wrong",
      details: error.response?.data || error.message,
    });
  }
});

app.get("/", (req, res) => {
  res.send("Server is Running");
});

app.listen(PORT, () => {
  console.log(`Server Running at http://localhost:${PORT}`);
});
