import { RequestHandler } from "express";
import expenseModel from "../models/expense";
import createHttpError from "http-errors";
import { Content, GoogleGenerativeAI } from "@google/generative-ai";
import "dotenv/config";
import env from "../util/validateEnv";
import { assertIsDefined } from "../util/assertIsDefined";


export const getSuggestion: RequestHandler = async (req, res, next) => {
  
  const authenticatedUserId = req.session.userId;
  const chatHistory = req.body.chatHistory;
  const message = req.body.message;

  const genAI = new GoogleGenerativeAI(process.env.API_KEY || env.API_KEY)
  
    const model = genAI.getGenerativeModel({model: "gemini-pro"})

    const chat = model.startChat({
      history: chatHistory,
      generationConfig: {
        maxOutputTokens: 100,
      },
    });

    const result = await chat.sendMessage(message)
    const response = await result.response
    const text = response.text()
    
    res.json(text);
  
};
