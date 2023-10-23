import "reflect-metadata";
import { Service, Container } from "typedi";

import { ResponseError } from "@apis/error";
import DocumentRepository from "@repositories/document";
import JwtService from "./jwt.service";

@Service()
export default class BrowseService {
  private documentModel: DocumentRepository;

  constructor(documentModel: DocumentRepository) {
    this.documentModel = documentModel;
  }

  async browseDocumentList(id: number, cursor: string, userID: string) {
    const limit = Number(process.env.DOCUMENT_LIMIT);

    const isFirstPage = !!id;

    let documents = null;

    if (isFirstPage) {
      documents = await this.documentModel.browseFirstQuery({
        userID,
        limit,
      });
    } else {
      if (!cursor || !id) {
        throw new ResponseError({
          httpStatusCode: 400,
          errorCode: 1201,
          message: "wrong query parameters",
        });
      }
      documents = await this.documentModel.browseQuery({
        userID,
        limit,
        cursor,
        id,
      });
    }

    const previewDocuments = documents.map((doc) => {
      return { ...doc, form: doc.form.replace(/(<([^>]+)>)/gi, "") };
    });

    return previewDocuments;
  }
}
