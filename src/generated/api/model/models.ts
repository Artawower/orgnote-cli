import localVarRequest from 'request';

export * from './filesUploadPostRequest.js';
export * from './handlersCreatingNote.js';
export * from './handlersDeletedNote.js';
export * from './handlersHttpErrorAny.js';
export * from './handlersHttpResponseAnyAny.js';
export * from './handlersHttpResponseArrayModelsAPITokenAny.js';
export * from './handlersHttpResponseArrayModelsPublicNoteModelsPagination.js';
export * from './handlersHttpResponseArrayStringAny.js';
export * from './handlersHttpResponseHandlersOAuthRedirectDataAny.js';
export * from './handlersHttpResponseHandlersSyncNotesResponseAny.js';
export * from './handlersHttpResponseModelsAPITokenAny.js';
export * from './handlersHttpResponseModelsPublicNoteAny.js';
export * from './handlersHttpResponseModelsUserPersonalInfoAny.js';
export * from './handlersOAuthRedirectData.js';
export * from './handlersSubscribeBody.js';
export * from './handlersSyncNotesRequest.js';
export * from './handlersSyncNotesResponse.js';
export * from './modelsAPIToken.js';
export * from './modelsCategory.js';
export * from './modelsNoteHeading.js';
export * from './modelsNoteLink.js';
export * from './modelsNoteMeta.js';
export * from './modelsPagination.js';
export * from './modelsPublicNote.js';
export * from './modelsPublicUser.js';
export * from './modelsUserPersonalInfo.js';

import * as fs from 'fs';

export interface RequestDetailedFile {
    value: Buffer;
    options?: {
        filename?: string;
        contentType?: string;
    }
}

export type RequestFile = string | Buffer | fs.ReadStream | RequestDetailedFile;


import { FilesUploadPostRequest } from './filesUploadPostRequest.js';
import { HandlersCreatingNote } from './handlersCreatingNote.js';
import { HandlersDeletedNote } from './handlersDeletedNote.js';
import { HandlersHttpErrorAny } from './handlersHttpErrorAny.js';
import { HandlersHttpResponseAnyAny } from './handlersHttpResponseAnyAny.js';
import { HandlersHttpResponseArrayModelsAPITokenAny } from './handlersHttpResponseArrayModelsAPITokenAny.js';
import { HandlersHttpResponseArrayModelsPublicNoteModelsPagination } from './handlersHttpResponseArrayModelsPublicNoteModelsPagination.js';
import { HandlersHttpResponseArrayStringAny } from './handlersHttpResponseArrayStringAny.js';
import { HandlersHttpResponseHandlersOAuthRedirectDataAny } from './handlersHttpResponseHandlersOAuthRedirectDataAny.js';
import { HandlersHttpResponseHandlersSyncNotesResponseAny } from './handlersHttpResponseHandlersSyncNotesResponseAny.js';
import { HandlersHttpResponseModelsAPITokenAny } from './handlersHttpResponseModelsAPITokenAny.js';
import { HandlersHttpResponseModelsPublicNoteAny } from './handlersHttpResponseModelsPublicNoteAny.js';
import { HandlersHttpResponseModelsUserPersonalInfoAny } from './handlersHttpResponseModelsUserPersonalInfoAny.js';
import { HandlersOAuthRedirectData } from './handlersOAuthRedirectData.js';
import { HandlersSubscribeBody } from './handlersSubscribeBody.js';
import { HandlersSyncNotesRequest } from './handlersSyncNotesRequest.js';
import { HandlersSyncNotesResponse } from './handlersSyncNotesResponse.js';
import { ModelsAPIToken } from './modelsAPIToken.js';
import { ModelsCategory } from './modelsCategory.js';
import { ModelsNoteHeading } from './modelsNoteHeading.js';
import { ModelsNoteLink } from './modelsNoteLink.js';
import { ModelsNoteMeta } from './modelsNoteMeta.js';
import { ModelsPagination } from './modelsPagination.js';
import { ModelsPublicNote } from './modelsPublicNote.js';
import { ModelsPublicUser } from './modelsPublicUser.js';
import { ModelsUserPersonalInfo } from './modelsUserPersonalInfo.js';

/* tslint:disable:no-unused-variable */
let primitives = [
                    "string",
                    "boolean",
                    "double",
                    "integer",
                    "long",
                    "float",
                    "number",
                    "any"
                 ];

let enumsMap: {[index: string]: any} = {
        "HandlersCreatingNote.EncryptedEnum": HandlersCreatingNote.EncryptedEnum,
        "ModelsCategory": ModelsCategory,
        "ModelsPublicNote.EncryptedEnum": ModelsPublicNote.EncryptedEnum,
}

let typeMap: {[index: string]: any} = {
    "FilesUploadPostRequest": FilesUploadPostRequest,
    "HandlersCreatingNote": HandlersCreatingNote,
    "HandlersDeletedNote": HandlersDeletedNote,
    "HandlersHttpErrorAny": HandlersHttpErrorAny,
    "HandlersHttpResponseAnyAny": HandlersHttpResponseAnyAny,
    "HandlersHttpResponseArrayModelsAPITokenAny": HandlersHttpResponseArrayModelsAPITokenAny,
    "HandlersHttpResponseArrayModelsPublicNoteModelsPagination": HandlersHttpResponseArrayModelsPublicNoteModelsPagination,
    "HandlersHttpResponseArrayStringAny": HandlersHttpResponseArrayStringAny,
    "HandlersHttpResponseHandlersOAuthRedirectDataAny": HandlersHttpResponseHandlersOAuthRedirectDataAny,
    "HandlersHttpResponseHandlersSyncNotesResponseAny": HandlersHttpResponseHandlersSyncNotesResponseAny,
    "HandlersHttpResponseModelsAPITokenAny": HandlersHttpResponseModelsAPITokenAny,
    "HandlersHttpResponseModelsPublicNoteAny": HandlersHttpResponseModelsPublicNoteAny,
    "HandlersHttpResponseModelsUserPersonalInfoAny": HandlersHttpResponseModelsUserPersonalInfoAny,
    "HandlersOAuthRedirectData": HandlersOAuthRedirectData,
    "HandlersSubscribeBody": HandlersSubscribeBody,
    "HandlersSyncNotesRequest": HandlersSyncNotesRequest,
    "HandlersSyncNotesResponse": HandlersSyncNotesResponse,
    "ModelsAPIToken": ModelsAPIToken,
    "ModelsNoteHeading": ModelsNoteHeading,
    "ModelsNoteLink": ModelsNoteLink,
    "ModelsNoteMeta": ModelsNoteMeta,
    "ModelsPagination": ModelsPagination,
    "ModelsPublicNote": ModelsPublicNote,
    "ModelsPublicUser": ModelsPublicUser,
    "ModelsUserPersonalInfo": ModelsUserPersonalInfo,
}

export class ObjectSerializer {
    public static findCorrectType(data: any, expectedType: string) {
        if (data == undefined) {
            return expectedType;
        } else if (primitives.indexOf(expectedType.toLowerCase()) !== -1) {
            return expectedType;
        } else if (expectedType === "Date") {
            return expectedType;
        } else {
            if (enumsMap[expectedType]) {
                return expectedType;
            }

            if (!typeMap[expectedType]) {
                return expectedType; // w/e we don't know the type
            }

            // Check the discriminator
            let discriminatorProperty = typeMap[expectedType].discriminator;
            if (discriminatorProperty == null) {
                return expectedType; // the type does not have a discriminator. use it.
            } else {
                if (data[discriminatorProperty]) {
                    var discriminatorType = data[discriminatorProperty];
                    if(typeMap[discriminatorType]){
                        return discriminatorType; // use the type given in the discriminator
                    } else {
                        return expectedType; // discriminator did not map to a type
                    }
                } else {
                    return expectedType; // discriminator was not present (or an empty string)
                }
            }
        }
    }

    public static serialize(data: any, type: string) {
        if (data == undefined) {
            return data;
        } else if (primitives.indexOf(type.toLowerCase()) !== -1) {
            return data;
        } else if (type.lastIndexOf("Array<", 0) === 0) { // string.startsWith pre es6
            let subType: string = type.replace("Array<", ""); // Array<Type> => Type>
            subType = subType.substring(0, subType.length - 1); // Type> => Type
            let transformedData: any[] = [];
            for (let index = 0; index < data.length; index++) {
                let datum = data[index];
                transformedData.push(ObjectSerializer.serialize(datum, subType));
            }
            return transformedData;
        } else if (type === "Date") {
            return data.toISOString();
        } else {
            if (enumsMap[type]) {
                return data;
            }
            if (!typeMap[type]) { // in case we dont know the type
                return data;
            }

            // Get the actual type of this object
            type = this.findCorrectType(data, type);

            // get the map for the correct type.
            let attributeTypes = typeMap[type].getAttributeTypeMap();
            let instance: {[index: string]: any} = {};
            for (let index = 0; index < attributeTypes.length; index++) {
                let attributeType = attributeTypes[index];
                instance[attributeType.baseName] = ObjectSerializer.serialize(data[attributeType.name], attributeType.type);
            }
            return instance;
        }
    }

    public static deserialize(data: any, type: string) {
        // polymorphism may change the actual type.
        type = ObjectSerializer.findCorrectType(data, type);
        if (data == undefined) {
            return data;
        } else if (primitives.indexOf(type.toLowerCase()) !== -1) {
            return data;
        } else if (type.lastIndexOf("Array<", 0) === 0) { // string.startsWith pre es6
            let subType: string = type.replace("Array<", ""); // Array<Type> => Type>
            subType = subType.substring(0, subType.length - 1); // Type> => Type
            let transformedData: any[] = [];
            for (let index = 0; index < data.length; index++) {
                let datum = data[index];
                transformedData.push(ObjectSerializer.deserialize(datum, subType));
            }
            return transformedData;
        } else if (type === "Date") {
            return new Date(data);
        } else {
            if (enumsMap[type]) {// is Enum
                return data;
            }

            if (!typeMap[type]) { // dont know the type
                return data;
            }
            let instance = new typeMap[type]();
            let attributeTypes = typeMap[type].getAttributeTypeMap();
            for (let index = 0; index < attributeTypes.length; index++) {
                let attributeType = attributeTypes[index];
                instance[attributeType.name] = ObjectSerializer.deserialize(data[attributeType.baseName], attributeType.type);
            }
            return instance;
        }
    }
}

export interface Authentication {
    /**
    * Apply authentication settings to header and query params.
    */
    applyToRequest(requestOptions: localVarRequest.Options): Promise<void> | void;
}

export class HttpBasicAuth implements Authentication {
    public username: string = '';
    public password: string = '';

    applyToRequest(requestOptions: localVarRequest.Options): void {
        requestOptions.auth = {
            username: this.username, password: this.password
        }
    }
}

export class HttpBearerAuth implements Authentication {
    public accessToken: string | (() => string) = '';

    applyToRequest(requestOptions: localVarRequest.Options): void {
        if (requestOptions && requestOptions.headers) {
            const accessToken = typeof this.accessToken === 'function'
                            ? this.accessToken()
                            : this.accessToken;
            requestOptions.headers["Authorization"] = "Bearer " + accessToken;
        }
    }
}

export class ApiKeyAuth implements Authentication {
    public apiKey: string = '';

    constructor(private location: string, private paramName: string) {
    }

    applyToRequest(requestOptions: localVarRequest.Options): void {
        if (this.location == "query") {
            (<any>requestOptions.qs)[this.paramName] = this.apiKey;
        } else if (this.location == "header" && requestOptions && requestOptions.headers) {
            requestOptions.headers[this.paramName] = this.apiKey;
        } else if (this.location == 'cookie' && requestOptions && requestOptions.headers) {
            if (requestOptions.headers['Cookie']) {
                requestOptions.headers['Cookie'] += '; ' + this.paramName + '=' + encodeURIComponent(this.apiKey);
            }
            else {
                requestOptions.headers['Cookie'] = this.paramName + '=' + encodeURIComponent(this.apiKey);
            }
        }
    }
}

export class OAuth implements Authentication {
    public accessToken: string = '';

    applyToRequest(requestOptions: localVarRequest.Options): void {
        if (requestOptions && requestOptions.headers) {
            requestOptions.headers["Authorization"] = "Bearer " + this.accessToken;
        }
    }
}

export class VoidAuth implements Authentication {
    public username: string = '';
    public password: string = '';

    applyToRequest(_: localVarRequest.Options): void {
        // Do nothing
    }
}

export type Interceptor = (requestOptions: localVarRequest.Options) => (Promise<void> | void);
