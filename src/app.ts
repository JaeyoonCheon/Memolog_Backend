import express from "express";
import bodyParser from "body-parser";

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

app.use("/auth", authRouter);
app.use("/user", jwtAuth, userRouter);
app.use("/document", jwtAuth, documentRouter);
app.use("/browse", jwtAuth, browseRouter);
app.use("/stat", jwtAuth, statRouter);

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
