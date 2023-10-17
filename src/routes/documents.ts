import "reflect-metadata";
import express from "express";
import { Container } from "typedi";

import DocumentController from "@controllers/documents.controller";
import { wrapAsync } from "@errors/error";

export const router = express.Router();
const documentControllerInstance = Container.get(DocumentController);

interface documentQuery {
  id?: number;
  cursor?: string;
  sort: string;
  order: string;
}
interface documentSearchQuery {
  id?: number;
  cursor?: string;
  keyword: string;
}

router.get("/", wrapAsync(documentControllerInstance.getDocumentList));

router.get("/search", wrapAsync(documentControllerInstance.searchDocumentList));

router.get("/:id", wrapAsync(documentControllerInstance.getDocument));

router.post("/", wrapAsync(documentControllerInstance.postDocument));

router.post("/:id", wrapAsync(documentControllerInstance.updateDocument));

router.delete("/:id", wrapAsync(documentControllerInstance.deleteDocument));
