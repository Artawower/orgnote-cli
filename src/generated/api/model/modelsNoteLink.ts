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

export class ModelsNoteLink {
    'name'?: string;
    'url'?: string;

    static discriminator: string | undefined = undefined;

    static attributeTypeMap: Array<{name: string, baseName: string, type: string}> = [
        {
            "name": "name",
            "baseName": "name",
            "type": "string"
        },
        {
            "name": "url",
            "baseName": "url",
            "type": "string"
        }    ];

    static getAttributeTypeMap() {
        return ModelsNoteLink.attributeTypeMap;
    }
}

