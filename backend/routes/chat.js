import express from "express";
import OpenAI from "openai";
import dotenv from "dotenv";

import personaMap from "../utils/personaMap.js";

dotenv.config();

const router = express.Router();

const openai = new OpenAI({
  apiKey: process.env.GOOGLE_AI_STUDIO_KEY,
  baseURL:
    "https://generativelanguage.googleapis.com/v1beta/openai/",
});

// past run me sanitize nahi kar raha tha ye

function sanitizeResponse(text) {
  if (!text) return "";

  let cleaned = text;

  cleaned = cleaned
    .replace(/<thought>[\s\S]*?<\/thought>/gi, "")
    .replace(/<thinking>[\s\S]*?<\/thinking>/gi, "")
    .replace(/<analysis>[\s\S]*?<\/analysis>/gi, "");


  cleaned = cleaned
    .replace(/^\s*Reasoning:.*$/gim, "")
    .replace(/^\s*Analysis:.*$/gim, "")
    .replace(/^\s*Chain.of.Thought:.*$/gim, "");


  cleaned = cleaned
    .replace(/```thinking[\s\S]*?```/gi, "")
    .replace(/```analysis[\s\S]*?```/gi, "");


  if (cleaned.includes("FINAL ANSWER:")) {
    cleaned =
      cleaned.split("FINAL ANSWER:")[1];
  }

  return cleaned.trim();
}

// main route

router.post("/", async (req, res) => {

  try {

    const {
      persona,
      message,
      history = [],
    } = req.body;



    if (!persona || !message) {
      return res.status(400).json({
        success: false,
        error:
          "Persona and message are required.",
      });
    }

    const systemPrompt = personaMap[persona];

    if (!systemPrompt) {
      return res.status(400).json({
        success: false,
        error: "Invalid persona selected.",
      });
    }



    const limitedHistory =
      history.slice(-10);



    const messages = [
      {
        role: "system",
        content: systemPrompt,
      },

      ...limitedHistory,

      {
        role: "user",
        content: message,
      },
    ];


    const response =
      await openai.chat.completions.create({
        model: process.env.MODEL_NAME || "gemini-2.5-flash-lite",

        temperature: 0.6,

        messages,
      });



    let assistantReply =
      response.choices[0].message.content;




    assistantReply =
      sanitizeResponse(assistantReply);


    res.status(200).json({
      success: true,
      reply: assistantReply,
    });

  } catch (error) {

    console.error(
      "Chat Route Error:",
      error.message
    );

    res.status(500).json({
      success: false,
      error:
        "Something went wrong while communicating with the AI.",
    });
  }
});

export default router;