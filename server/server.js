const express = require("express");
const http = require("http");
const { WebSocketServer } = require("ws");
const OpenAI = require("openai");
require("dotenv").config();

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

const openai = new OpenAI({ apiKey: process.env.REACT_APP_JGKEY });

wss.on("connection", (ws) => {
  ws.on("message", async (rawMessages) => {
    try {
      const parsedData = JSON.parse(rawMessages.toString());
      const messageHistory = parsedData.messages;

      messageHistory.unshift({role: "system", content: "You are a helpful assistant. Read the conversation and respond to the last thing the user wrote." })
      //console.log(messageHistory)

      const stream = await openai.chat.completions.create({
        model: "gpt-4.1",
        messages: messageHistory,
        stream: true,
      });

      for await (const chunk of stream) {
        if (chunk.choices[0]?.delta?.content) {
          ws.send(chunk.choices[0].delta.content);
        }
      }
    } catch (error) {
      ws.send("Error processing your request -- " + error);
    }
  });
});

server.listen(3001, () => console.log("Server running on port 3001"));