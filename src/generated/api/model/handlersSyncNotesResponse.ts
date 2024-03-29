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
import { HandlersDeletedNote } from './handlersDeletedNote.js';
import { ModelsPublicNote } from './modelsPublicNote.js';

export class HandlersSyncNotesResponse {
    'deletedNotes'?: Array<HandlersDeletedNote>;
    'notes'?: Array<ModelsPublicNote>;

    static discriminator: string | undefined = undefined;

    static attributeTypeMap: Array<{name: string, baseName: string, type: string}> = [
        {
            "name": "deletedNotes",
            "baseName": "deletedNotes",
            "type": "Array<HandlersDeletedNote>"
        },
        {
            "name": "notes",
            "baseName": "notes",
            "type": "Array<ModelsPublicNote>"
        }    ];

    static getAttributeTypeMap() {
        return HandlersSyncNotesResponse.attributeTypeMap;
    }
}

