const express = require("express");

const app = express();

const PORT = process.env.SERVER_PORT || 3367;

import { router as indexRouter } from "./route/index";
import { router as documentRouter } from "./route/document";
import { router as userRouter } from "./route/user";

app.use("/", indexRouter);
app.use("/document", documentRouter);
app.use("/user", userRouter);

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
