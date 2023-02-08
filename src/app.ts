import express, { Request, Response, NextFunction } from "express";

const app = express();

const PORT = process.env.SERVER_PORT || 3367;

const pg = require("./database/postgreSQL/connnection");

pg.connect();

import { router as indexRouter } from "./route/index";

app.use("/", indexRouter);

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
