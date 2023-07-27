export * from './authApi.js';
import { AuthApi } from './authApi.js';
export * from './filesApi.js';
import { FilesApi } from './filesApi.js';
export * from './notesApi.js';
import { NotesApi } from './notesApi.js';
export * from './tagsApi.js';
import { TagsApi } from './tagsApi.js';
import * as http from 'http';

export class HttpError extends Error {
    constructor (public response: http.IncomingMessage, public body: any, public statusCode?: number) {
        super('HTTP request failed');
        this.name = 'HttpError';
    }
}

export { RequestFile } from '../model/models.js';

export const APIS = [AuthApi, FilesApi, NotesApi, TagsApi];
