// handler.js
"use strict";

const express = require("express");
const serverless = require("serverless-http");
const { MongoClient } = require("mongodb");

const uri =
  "mongodb+srv://Casion:noisac@cluster0.uaujt.mongodb.net/casiondb?retryWrites=true&w=majority";
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
let db;

const createConn = async () => {
  await client.connect();
  db = client.db("casiondb");
};

const performQuery = async () => {
  const noticias = await db.collection("noticias").find({}).toArray();
  return JSON.stringify(noticias);
};

const app = express();

app.get("/hello", async function (req, res) {
  if (!client.isConnected()) {
    // Cold start or connection timed out. Create new connection.
    try {
      await createConn();
    } catch (e) {
      res.json({
        error: e.message,
      });
      return;
    }
  }

  // Connection ready. Perform insert and return result.
  try {
    res.json(await performQuery());
    client.close();
    return;
  } catch (e) {
    res.send({
      error: e.message,
    });
    return;
  }
});

module.exports = {
  app,
  hello: serverless(app),
};
