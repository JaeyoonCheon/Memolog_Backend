import "reflect-metadata";
import express from "express";
import bodyParser from "body-parser";
import dotenv from "dotenv";

const app = express();
dotenv.config();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const PORT = process.env.SERVER_PORT || 3367;

import { router as documentRouter } from "./routes/documents";
import { router as userRouter } from "./routes/users";
import { router as browseRouter } from "./routes/browse";
import { router as authRouter } from "./routes/auth";
import { router as statRouter } from "./routes/statistics";
import { jwtAuth } from "@middlewares/jwtAuth";
import { globalErrorHandler } from "@middlewares/errorHandler";

app.get("/", (req, res) => {
  res.send("Hello World!");
});
app.use("/auth", authRouter);
app.use("/user", jwtAuth, userRouter);
app.use("/document", jwtAuth, documentRouter);
app.use("/browse", jwtAuth, browseRouter);
app.use("/stat", jwtAuth, statRouter);
app.use(globalErrorHandler);

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
