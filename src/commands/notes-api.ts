import FormData from 'form-data';
import { NotesApi as OriginalNotesApi } from '../generated/api/api/notesApi.js';
import { Note } from 'types';
import http from 'http';
import localVarRequest from 'request';
import { ObjectSerializer } from '../generated/api/model/models.js';
import { HttpError } from '../generated/api/api/apis.js';

/*
 * Patch generated api to use multipart/form-data correctly.
 * This is temporary solution.
 */
export class NotesApi extends OriginalNotesApi {
  public async notesBulkUpsert(
    notes: Note[],
    files: Array<{ blob: Buffer; fileName: string }>
  ): Promise<{ response: http.IncomingMessage; body: object }> {
    const formData = new FormData();
    const localVarPath = this.basePath + '/notes/bulk-upsert';

    let localVarHeaderParams: any = (<any>Object).assign(this._defaultHeaders);

    localVarHeaderParams['Content-Type'] = 'multipart/form-data';

    let localVarRequestOptions: localVarRequest.Options = {
      method: 'PUT',
      qs: {},
      headers: localVarHeaderParams,
      uri: localVarPath,
      useQuerystring: this._useQuerystring,
      formData: {
        notes: notes.map((n) => JSON.stringify(n)),
        files: files.map((f) => ({
          value: f.blob,
          options: {
            filename: f.fileName,
            contentType: 'file',
          },
        })),
      },
    };

    let authenticationPromise = Promise.resolve();
    authenticationPromise = authenticationPromise.then(() =>
      this.authentications.default.applyToRequest(localVarRequestOptions)
    );

    let interceptorPromise = authenticationPromise;
    for (const interceptor of this.interceptors) {
      interceptorPromise = interceptorPromise.then(() =>
        interceptor(localVarRequestOptions)
      );
    }

    return interceptorPromise.then(() => {
      return new Promise<{ response: http.IncomingMessage; body: object }>(
        (resolve, reject) => {
          localVarRequest(localVarRequestOptions, (error, response, body) => {
            if (error) {
              reject(error);
            } else {
              if (
                response.statusCode &&
                response.statusCode >= 200 &&
                response.statusCode <= 299
              ) {
                body = ObjectSerializer.deserialize(body, 'object');
                resolve({ response: response, body: body });
              } else {
                reject(new HttpError(response, body, response.statusCode));
              }
            }
          });
        }
      );
    });
  }
}
