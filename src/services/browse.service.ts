import "reflect-metadata";
import { Service, Container } from "typedi";

import { BusinessLogicError } from "@apis/error";
import DocumentRepository from "@repositories/document";

@Service()
export default class BrowseService {
  private documentModel: DocumentRepository;

  constructor(documentModel: DocumentRepository) {
    this.documentModel = documentModel;
  }

  async browseDocumentList(id: number, cursor: string, userID: string) {
    const limit = Number(process.env.DOCUMENT_LIMIT);

    console.log(id);
    console.log(cursor);

    const isFirstPage = !!cursor;
    console.log(isFirstPage);

    let documents = null;

    if (!isFirstPage) {
      documents = await this.documentModel.browseFirstQuery({
        userID,
        limit,
      });
    } else {
      if (!cursor || !id) {
        throw new BusinessLogicError({
          from: "browse.service",
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
