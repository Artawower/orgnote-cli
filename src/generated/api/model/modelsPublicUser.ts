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

import { RequestFile } from './models';

export class ModelsPublicUser {
    'avatarUrl'?: string;
    'email'?: string;
    'id'?: string;
    'name'?: string;
    'nickName'?: string;
    'profileUrl'?: string;

    static discriminator: string | undefined = undefined;

    static attributeTypeMap: Array<{name: string, baseName: string, type: string}> = [
        {
            "name": "avatarUrl",
            "baseName": "avatarUrl",
            "type": "string"
        },
        {
            "name": "email",
            "baseName": "email",
            "type": "string"
        },
        {
            "name": "id",
            "baseName": "id",
            "type": "string"
        },
        {
            "name": "name",
            "baseName": "name",
            "type": "string"
        },
        {
            "name": "nickName",
            "baseName": "nickName",
            "type": "string"
        },
        {
            "name": "profileUrl",
            "baseName": "profileUrl",
            "type": "string"
        }    ];

    static getAttributeTypeMap() {
        return ModelsPublicUser.attributeTypeMap;
    }
}

