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
import { ModelsNoteMeta } from './modelsNoteMeta.js';

export class HandlersCreatingNote {
    'content'?: string;
    'createdAt'?: string;
    'encrypted'?: HandlersCreatingNote.EncryptedEnum;
    'filePath'?: Array<string>;
    'id'?: string;
    'meta'?: ModelsNoteMeta;
    'touchedAt'?: string;
    'updatedAt'?: string;

    static discriminator: string | undefined = undefined;

    static attributeTypeMap: Array<{name: string, baseName: string, type: string}> = [
        {
            "name": "content",
            "baseName": "content",
            "type": "string"
        },
        {
            "name": "createdAt",
            "baseName": "createdAt",
            "type": "string"
        },
        {
            "name": "encrypted",
            "baseName": "encrypted",
            "type": "HandlersCreatingNote.EncryptedEnum"
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
        },
        {
            "name": "touchedAt",
            "baseName": "touchedAt",
            "type": "string"
        },
        {
            "name": "updatedAt",
            "baseName": "updatedAt",
            "type": "string"
        }    ];

    static getAttributeTypeMap() {
        return HandlersCreatingNote.attributeTypeMap;
    }
}

export namespace HandlersCreatingNote {
    export enum EncryptedEnum {
        Gpg = <any> 'gpg',
        Password = <any> 'password'
    }
}
