const fs = require("fs");
const axios = require("axios");

const GEMINI_MODEL = "gemini-1.5-flash";
const GEMINI_ENDPOINT_BASE = "https://generativelanguage.googleapis.com/v1beta/models";

const EXTRACTION_PROMPT = `Extract the following information from this Pakistani CNIC card image and return ONLY JSON.

Fields:
cnic_number
name
father_name
date_of_birth
issue_date
expiry_date
gender

If any field is missing return null.`;

function stripCodeFences(text) {
  if (!text || typeof text !== "string") {
    return "";
  }

  const trimmed = text.trim();

  if (trimmed.startsWith("```") && trimmed.endsWith("```")) {
    return trimmed
      .replace(/^```[a-zA-Z]*\n?/, "")
      .replace(/```$/, "")
      .trim();
  }

  return trimmed;
}

function normalizeExtractedData(raw = {}) {
  return {
    cnic_number: raw.cnic_number ?? null,
    name: raw.name ?? null,
    father_name: raw.father_name ?? null,
    date_of_birth: raw.date_of_birth ?? null,
    issue_date: raw.issue_date ?? null,
    expiry_date: raw.expiry_date ?? null,
    gender: raw.gender ?? null,
  };
}

async function readImageAsBase64({ filePath, buffer }) {
  if (buffer && Buffer.isBuffer(buffer)) {
    return buffer.toString("base64");
  }

  if (filePath) {
    const fileBuffer = await fs.promises.readFile(filePath);
    return fileBuffer.toString("base64");
  }

  throw new Error("Either filePath or buffer must be provided");
}

async function extractCnicDataFromGemini({ filePath, buffer, mimeType = "image/jpeg" }) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not set");
  }

  const imageBase64 = await readImageAsBase64({ filePath, buffer });
  const endpoint = `${GEMINI_ENDPOINT_BASE}/${GEMINI_MODEL}:generateContent?key=${apiKey}`;

  const payload = {
    contents: [
      {
        parts: [
          { text: EXTRACTION_PROMPT },
          {
            inlineData: {
              mimeType,
              data: imageBase64,
            },
          },
        ],
      },
    ],
    generationConfig: {
      temperature: 0,
      responseMimeType: "application/json",
    },
  };

  const response = await axios.post(endpoint, payload, {
    headers: {
      "Content-Type": "application/json",
    },
    timeout: 30000,
  });

  const parts = response?.data?.candidates?.[0]?.content?.parts || [];
  const textPart = parts.find((part) => typeof part.text === "string");

  if (!textPart || !textPart.text) {
    throw new Error("No extractable response from Gemini");
  }

  const cleaned = stripCodeFences(textPart.text);
  const parsed = JSON.parse(cleaned);

  return normalizeExtractedData(parsed);
}

module.exports = {
  extractCnicDataFromGemini,
};
