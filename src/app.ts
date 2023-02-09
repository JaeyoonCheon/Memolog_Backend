const express = require("express");
const bodyParser = require("body-parser");

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const PORT = process.env.SERVER_PORT || 3367;

import { router as indexRouter } from "./route/index";
import { router as documentRouter } from "./route/documents";
import { router as userRouter } from "./route/users";

app.use("/", indexRouter);
app.use("/document", documentRouter);
app.use("/user", userRouter);

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
