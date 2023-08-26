import { FilesApi as OriginalFilesApi } from '../generated/api/api.js';
import localVarRequest from 'request';
import http from 'http';
import { ObjectSerializer } from '../generated/api/model/models.js';
import { HttpError } from '../generated/api/api/apis.js';

/*
 * Patch over generated api to use multipart/form-data correctly.
 */
export class FilesApi extends OriginalFilesApi {
  public async uploadFiles(
    files: Array<{ blob: Buffer; fileName: string }>
  ): Promise<unknown> {
    if (!files.length) {
      return;
    }

    files.forEach(async (f) => {
      await this.uploadFile(f);
    });
  }

  public async uploadFile(file: {
    blob: Buffer;
    fileName: string;
  }): Promise<unknown> {
    const localVarPath = this.basePath + '/files/upload';
    let localVarQueryParameters: any = {};
    let localVarHeaderParams: any = (<any>Object).assign(
      {},
      this._defaultHeaders
    );
    const produces = ['application/json'];
    // give precedence to 'application/json'
    if (produces.indexOf('application/json') >= 0) {
      localVarHeaderParams.Accept = 'application/json';
    } else {
      localVarHeaderParams.Accept = produces.join(',');
    }
    let localVarFormParams: any = {};

    let localVarUseFormData = false;

    let localVarRequestOptions: localVarRequest.Options = {
      method: 'POST',
      qs: localVarQueryParameters,
      headers: localVarHeaderParams,
      uri: localVarPath,
      useQuerystring: this._useQuerystring,
      json: true,
      formData: {
        files: [
          {
            value: file.blob,
            options: {
              filename: file.fileName,
              contentType: 'file',
            },
          },
        ],
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
      if (Object.keys(localVarFormParams).length) {
        if (localVarUseFormData) {
          (<any>localVarRequestOptions).formData = localVarFormParams;
        } else {
          localVarRequestOptions.form = localVarFormParams;
        }
      }
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
