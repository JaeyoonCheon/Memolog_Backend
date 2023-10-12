import express from "express";
import { Service, Container } from "typedi";

import BrowseController from "@controller/browse.controller";

export const router = express.Router();
const browseContainerInstance = Container.get(BrowseController);

interface BrowseQuery {
  id?: number;
  cursor?: string;
}

router.get("/", browseContainerInstance.browseDocumentList);
