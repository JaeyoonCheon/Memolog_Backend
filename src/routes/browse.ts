import "reflect-metadata";
import express from "express";
import { Service, Container } from "typedi";

import BrowseController from "@controllers/browse.controller";

export const router = express.Router();
const browseContainerInstance = Container.get(BrowseController);

interface BrowseQuery {
  id?: number;
  cursor?: string;
}

router.get("/", browseContainerInstance.browseDocumentList);
