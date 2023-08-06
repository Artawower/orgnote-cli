/**
 * Second Brain API
 * List of methods for work with second brain.
 *
 * The version of the OpenAPI document: 0.0.1
 * Contact: artawower@protonmail.com
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */

import { RequestFile } from './models.js';
import { HandlersSyncNotesResponse } from './handlersSyncNotesResponse.js';

export class HandlersHttpResponseHandlersSyncNotesResponseAny {
    'data'?: HandlersSyncNotesResponse;
    'meta'?: object;

    static discriminator: string | undefined = undefined;

    static attributeTypeMap: Array<{name: string, baseName: string, type: string}> = [
        {
            "name": "data",
            "baseName": "data",
            "type": "HandlersSyncNotesResponse"
        },
        {
            "name": "meta",
            "baseName": "meta",
            "type": "object"
        }    ];

    static getAttributeTypeMap() {
        return HandlersHttpResponseHandlersSyncNotesResponseAny.attributeTypeMap;
    }
}

