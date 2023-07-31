export * from './authApi';
import { AuthApi } from './authApi';
export * from './filesApi';
import { FilesApi } from './filesApi';
export * from './notesApi';
import { NotesApi } from './notesApi';
export * from './tagsApi';
import { TagsApi } from './tagsApi';
import * as http from 'http';

export class HttpError extends Error {
    constructor (public response: http.IncomingMessage, public body: any, public statusCode?: number) {
        super('HTTP request failed');
        this.name = 'HttpError';
    }
}

export { RequestFile } from '../model/models';

export const APIS = [AuthApi, FilesApi, NotesApi, TagsApi];
