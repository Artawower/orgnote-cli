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
import { ModelsNoteMeta } from './modelsNoteMeta.js';
import { ModelsPublicUser } from './modelsPublicUser.js';

export class ModelsPublicNote {
    'author'?: ModelsPublicUser;
    'content'?: string;
    'filePath'?: Array<string>;
    'id'?: string;
    'meta'?: ModelsNoteMeta;

    static discriminator: string | undefined = undefined;

    static attributeTypeMap: Array<{name: string, baseName: string, type: string}> = [
        {
            "name": "author",
            "baseName": "author",
            "type": "ModelsPublicUser"
        },
        {
            "name": "content",
            "baseName": "content",
            "type": "string"
        },
        {
            "name": "filePath",
            "baseName": "filePath",
            "type": "Array<string>"
        },
        {
            "name": "id",
            "baseName": "id",
            "type": "string"
        },
        {
            "name": "meta",
            "baseName": "meta",
            "type": "ModelsNoteMeta"
        }    ];

    static getAttributeTypeMap() {
        return ModelsPublicNote.attributeTypeMap;
    }
}
