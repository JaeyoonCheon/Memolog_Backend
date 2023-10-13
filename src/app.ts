import "reflect-metadata";
import express from "express";
import bodyParser from "body-parser";

import { wrapAsync } from "@wrappers/error";

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const PORT = process.env.SERVER_PORT || 3367;

import { router as documentRouter } from "./route/documents";
import { router as userRouter } from "./route/users";
import { router as browseRouter } from "./route/browse";
import { router as authRouter } from "./route/auth";
import { router as statRouter } from "./route/statistics";
import { jwtAuth } from "./middleware/jwtAuth";
import { globalErrorHandler } from "@middleware/errorHandler";

app.use("/auth", wrapAsync(authRouter));
app.use("/user", jwtAuth, wrapAsync(userRouter));
app.use("/document", jwtAuth, wrapAsync(documentRouter));
app.use("/browse", jwtAuth, wrapAsync(browseRouter));
app.use("/stat", jwtAuth, wrapAsync(statRouter));
app.use(globalErrorHandler);

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
