import express from 'express';
import {MatchesRouter} from "./Routes/matches.js";
import * as http from "node:http";
import {attachWebSocketServer} from "./ws/server.js";

const app = express();
const port = Number(process.env.PORT) || 3000;
const host =process.env.HOST;

const server=http.createServer(app)

app.use(express.json());

app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the Real-Time Sport Engine API!' });
});
app.use('/matches',MatchesRouter);
const {broadcastMatchCreated}=attachWebSocketServer(server)

app.locals.broadcastMatchCreated = broadcastMatchCreated;
server.listen(port,host, () => {
  const baseUrl=host === '0.0.0.0'?`http://localhost:${port}`:`http://${host}/${port}`;
  console.log(`Server is running at ${baseUrl}`);
  console.log(`Server websocket is running on ${baseUrl.replace('http','ws')}/ws`)
});
