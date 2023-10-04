declare module "browse" {
  export interface BrowseFirstQuery {
    userID: string;
    limit: number;
  }
  export interface BrowseQuery {
    id: number;
    userID: string;
    cursor: string;
    limit: number;
  }
}
