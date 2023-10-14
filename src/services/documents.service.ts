import "reflect-metadata";
import { Container, Service } from "typedi";

import DocumentRepository from "@repositories/document";
import { CustomError } from "@errors/error";

@Service()
export default class DocumentService {
  private documentModel: DocumentRepository;

  constructor(documentModel: DocumentRepository) {
    this.documentModel = documentModel;
  }

  async createDocument(
    title: string,
    form: string,
    userID: string,
    scope: string,
    thumbnail_url: string,
    hashtags: string[]
  ) {
    const localeOffset = new Date().getTimezoneOffset() * 60000;
    const created_at = new Date(Date.now() - localeOffset);
    const updated_at = created_at;

    const docID = await this.documentModel.createDocument({
      title,
      form,
      created_at,
      updated_at,
      userID,
      scope,
      thumbnail_url,
      hashtags,
    });

    if (hashtags instanceof Array && hashtags.length > 0) {
      const hashtagIdsPromise = hashtags.map((hashtag) =>
        this.documentModel.addHashtag(hashtag)
      );
      const hashtagIds = await Promise.all(hashtagIdsPromise);

      await Promise.all(
        hashtagIds.map((hashId) =>
          this.documentModel.addDocumentHashtag(docID, hashId)
        )
      );
      await Promise.all(
        hashtagIds.map((hashId) =>
          this.documentModel.addHashtagLog(hashId, created_at)
        )
      );
    }
  }
  async readDocumentList(
    id: number,
    cursor: string,
    sort: string,
    order: string,
    userID: string
  ) {
    const limit = Number(process.env.DOCUMENT_LIMIT);

    if (!limit) {
      return;
    }

    const isFirstPage = !id;
    let documents = null;

    if (isFirstPage) {
      documents = await this.documentModel.readDocumentsFirstQuery({
        userID,
        limit,
        order,
        sort,
      });
    } else {
      if (!cursor || !id) {
        throw new CustomError({
          httpStatusCode: 400,
          errorCode: 1201,
          message: "wrong params",
        });
      }
      documents = await this.documentModel.readDocumentsQuery({
        userID,
        limit,
        cursor,
        id,
        order,
        sort,
      });
    }

    const previewDocuments = documents.map((doc) => {
      return { ...doc, form: doc.form.replace(/(<([^>]+)>)/gi, "") };
    });

    return previewDocuments;
  }
  async readDocument(id: number) {
    const document = await this.documentModel.readDocument(id);
    const hashtags = await this.documentModel.readHashtags(id);
    const filteredHashtags = hashtags.filter((hashtag) => hashtag.id !== null);

    const documentWithHashtag = { hashtags: filteredHashtags, ...document };

    return documentWithHashtag;
  }
  async searchDocumentList(
    id: number,
    cursor: string,
    userID: string,
    keyword: string
  ) {
    const limit = Number(process.env.DOCUMENT_LIMIT);
    if (!keyword || typeof keyword !== "string") {
      throw new CustomError({
        httpStatusCode: 400,
        errorCode: 1202,
        message: "Wrong keyword",
      });
    }
    const searchKeyword = keyword.startsWith("#")
      ? keyword.substring(1)
      : keyword;

    let documents = null;

    const isFirstQuery = !!id;

    if (isFirstQuery) {
      documents = await this.documentModel.findDocumentsFirstQuery({
        limit,
        searchKeyword,
        userID,
      });
    } else {
      if (!cursor || !id) {
        throw new CustomError({
          httpStatusCode: 400,
          errorCode: 1201,
          message: "wrong params",
        });
      }
      documents = await this.documentModel.findDocumentsQuery({
        cursor,
        id,
        limit,
        searchKeyword,
        userID,
      });
    }

    const previewDocuments = documents.map((doc) => {
      return { ...doc, form: doc.form.replace(/(<([^>]+)>)/gi, "") };
    });

    return previewDocuments;
  }
  async updateDocument(
    id: number,
    title: string,
    form: string,
    scope: string,
    thumbnail_url: string,
    hashtags: string[]
  ) {
    const localeOffset = new Date().getTimezoneOffset() * 60000;
    const updated_at = new Date(Date.now() - localeOffset);

    await this.documentModel.deleteDocumentHashtag(id);
    await this.documentModel.updateDocument({
      title,
      form,
      id,
      scope,
      thumbnail_url,
      updated_at,
    });

    if (hashtags instanceof Array && hashtags.length > 0) {
      const hashtagIdsPromise = hashtags.map((hashtag) =>
        this.documentModel.addHashtag(hashtag)
      );
      const hashtagIds = await Promise.all(hashtagIdsPromise);

      await Promise.all(
        hashtagIds.map((hashId) =>
          this.documentModel.addDocumentHashtag(id, hashId)
        )
      );

      await Promise.all(
        hashtagIds.map((hashId) =>
          this.documentModel.addHashtagLog(hashId, updated_at)
        )
      );
    }
  }
  async deleteDocument(id: number) {
    await this.documentModel.deleteDocumentHashtag(id);
    await this.documentModel.deleteDocument(id);
  }
}
