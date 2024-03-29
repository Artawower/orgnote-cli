/**
 * Org Note API
 * List of methods for work with Org Note.
 *
 * The version of the OpenAPI document: 0.0.1
 * Contact: artawower@protonmail.com
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */

import { RequestFile } from './models.js';
import { ModelsPublicNote } from './modelsPublicNote.js';

export class HandlersHttpResponseModelsPublicNoteAny {
    'data'?: ModelsPublicNote;
    'meta'?: object;

    static discriminator: string | undefined = undefined;

    static attributeTypeMap: Array<{name: string, baseName: string, type: string}> = [
        {
            "name": "data",
            "baseName": "data",
            "type": "ModelsPublicNote"
        },
        {
            "name": "meta",
            "baseName": "meta",
            "type": "object"
        }    ];

    static getAttributeTypeMap() {
        return HandlersHttpResponseModelsPublicNoteAny.attributeTypeMap;
    }
}

