import "reflect-metadata";
import express from "express";
import { Container } from "typedi";
import DocumentController from "@controller/documents.controller";

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

router.get("/", documentControllerInstance.getDocumentList);

router.get("/search", documentControllerInstance.searchDocumentList);

router.get("/:id", documentControllerInstance.getDocument);

router.post("/", documentControllerInstance.postDocument);

router.post("/:id", documentControllerInstance.updateDocument);

router.delete("/:id", documentControllerInstance.deleteDocument);
