declare module "document" {
  export interface Document {
    id: number;
    title: string;
    form: string;
    created_at: string;
    updated_at: string;
    scope: string;
    thumnail_url: string;
    user_id: number;
  }
  export interface Hashtag {
    id: number;
    name: string;
  }
  export interface ReadDocumentsFirstQuery {
    userID: string;
    limit: number;
    sort: string;
    order: string;
  }
  export interface ReadDocumentsQuery {
    id: number;
    userID: string;
    order: string;
    cursor: string;
    limit: number;
    sort: string;
  }
  export interface FindDocumentsFirstQuery {
    userID: string;
    limit: number;
    searchKeyword: string;
  }
  export interface FindDocumentsQuery {
    id: number;
    userID: string;
    cursor: string;
    limit: number;
    searchKeyword: string;
  }
  export interface UpdateDocument {
    id: number;
    title: string;
    form: string;
    updated_at: Date;
    scope: string;
    thumbnail_url: string;
  }
}
