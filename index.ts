import * as dotenv from "dotenv";
dotenv.config();

import { connect, send } from "./src/core/index.ts";

await connect();

console.log("Connected to Kafka producer");

await send({
  topic: "dev.test",
  messages: [{ value: "Hello World" }],
});

console.log("Sent message to Kafka");