/** Generate by swagger-axios-codegen */
// @ts-nocheck
/* eslint-disable */

/** Generate by swagger-axios-codegen */
/* eslint-disable */
// @ts-nocheck
import axiosStatic, { AxiosInstance, AxiosRequestConfig } from 'axios';

export interface IRequestOptions extends AxiosRequestConfig {
  /** only in axios interceptor config*/
  loading?: boolean;
  showError?: boolean;
}

export interface IRequestConfig {
  method?: any;
  headers?: any;
  url?: any;
  data?: any;
  params?: any;
}

// Add options interface
export interface ServiceOptions {
  axios?: AxiosInstance;
  /** only in axios interceptor config*/
  loading: boolean;
  showError: boolean;
}

// Add default options
export const serviceOptions: ServiceOptions = {};

// Instance selector
export function axios(configs: IRequestConfig, resolve: (p: any) => void, reject: (p: any) => void): Promise<any> {
  if (serviceOptions.axios) {
    return serviceOptions.axios
      .request(configs)
      .then(res => {
        resolve(res.data);
      })
      .catch(err => {
        reject(err);
      });
  } else {
    throw new Error('please inject yourself instance like axios  ');
  }
}

export function getConfigs(method: string, contentType: string, url: string, options: any): IRequestConfig {
  const configs: IRequestConfig = {
    loading: serviceOptions.loading,
    showError: serviceOptions.showError,
    ...options,
    method,
    url
  };
  configs.headers = {
    ...options.headers,
    'Content-Type': contentType
  };
  return configs;
}

export const basePath = '/v1';

export interface IList<T> extends Array<T> {}
export interface List<T> extends Array<T> {}
export interface IDictionary<TValue> {
  [key: string]: TValue;
}
export interface Dictionary<TValue> extends IDictionary<TValue> {}

export interface IListResult<T> {
  items?: T[];
}

export class ListResultDto<T> implements IListResult<T> {
  items?: T[];
}

export interface IPagedResult<T> extends IListResult<T> {
  totalCount?: number;
  items?: T[];
}

export class PagedResultDto<T = any> implements IPagedResult<T> {
  totalCount?: number;
  items?: T[];
}

// customer definition
// empty

export interface handlers_CreatedNote {
  /**  */
  content?: string;

  /**  */
  filePath?: string[];

  /**  */
  id?: string;

  /**  */
  meta?: models_NoteMeta;
}

export interface handlers_HttpError_any {
  /**  */
  data?: any | null;

  /**  */
  message?: string;
}

export interface handlers_HttpResponse_any_any {
  /**  */
  data?: any | null;

  /**  */
  meta?: any | null;
}

export interface handlers_HttpResponse_array_models_APIToken_any {
  /**  */
  data?: models_APIToken[];

  /**  */
  meta?: any | null;
}

export interface handlers_HttpResponse_array_models_PublicNote_models_Pagination {
  /**  */
  data?: models_PublicNote[];

  /**  */
  meta?: models_Pagination;
}

export interface handlers_HttpResponse_array_string_any {
  /**  */
  data?: string[];

  /**  */
  meta?: any | null;
}

export interface handlers_HttpResponse_handlers_OAuthRedirectData_any {
  /**  */
  data?: handlers_OAuthRedirectData;

  /**  */
  meta?: any | null;
}

export interface handlers_HttpResponse_models_APIToken_any {
  /**  */
  data?: models_APIToken;

  /**  */
  meta?: any | null;
}

export interface handlers_HttpResponse_models_NoteGraph_any {
  /**  */
  data?: models_NoteGraph;

  /**  */
  meta?: any | null;
}

export interface handlers_HttpResponse_models_PublicNote_any {
  /**  */
  data?: models_PublicNote;

  /**  */
  meta?: any | null;
}

export interface handlers_HttpResponse_models_PublicUser_any {
  /**  */
  data?: models_PublicUser;

  /**  */
  meta?: any | null;
}

export interface handlers_OAuthRedirectData {
  /**  */
  redirectUrl?: string;
}

export interface models_APIToken {
  /**  */
  id?: string;

  /**  */
  permission?: string;

  /**  */
  token?: string;
}

export interface models_GraphNoteLink {
  /**  */
  source?: string;

  /**  */
  target?: string;
}

export interface models_GraphNoteNode {
  /**  */
  id?: string;

  /**  */
  title?: string;

  /**  */
  weight?: number;
}

export interface models_NoteGraph {
  /**  */
  links?: models_GraphNoteLink[];

  /**  */
  nodes?: models_GraphNoteNode[];
}

export interface models_NoteHeading {
  /**  */
  level?: number;

  /**  */
  text?: string;
}

export interface models_NoteLink {
  /**  */
  name?: string;

  /**  */
  url?: string;
}

export interface models_NoteMeta {
  /**  */
  category?: models_category;

  /**  */
  description?: string;

  /**  */
  externalLinks?: models_NoteLink[];

  /**  */
  fileTags?: string[];

  /**  */
  headings?: models_NoteHeading[];

  /**  */
  images?: string[];

  /**  */
  linkedArticles?: models_NoteLink[];

  /**  */
  previewImg?: string;

  /**  */
  published?: boolean;

  /**  */
  startup?: string;

  /**  */
  title?: string;
}

export interface models_Pagination {
  /**  */
  limit?: number;

  /**  */
  offset?: number;

  /**  */
  total?: number;
}

export interface models_PublicNote {
  /**  */
  author?: models_PublicUser;

  /**  */
  content?: string;

  /**  */
  filePath?: string[];

  /**  */
  id?: string;

  /**  */
  meta?: models_NoteMeta;
}

export interface models_PublicUser {
  /**  */
  avatarUrl?: string;

  /**  */
  email?: string;

  /**  */
  id?: string;

  /**  */
  name?: string;

  /**  */
  nickName?: string;

  /**  */
  profileUrl?: string;
}

export enum models_category {
  'article' = 'article',
  'book' = 'book',
  'schedule' = 'schedule'
}
