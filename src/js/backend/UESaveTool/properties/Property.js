import { Serializer } from '../'
export class Property {
    constructor() {
        this.Name = "";
        this.Type = "";
    }
    /**
     * Per-property byte size getter
     * @returns {Number} `Size` in bytes of all attributes and properties held by this property to be serialized
     */
    get Size() {
        throw new Error(`Size getter not implemented for property: ${this.Type}`);
    }
    /**
     * Per-property deserialization function
     * @param {Serializer} serial Serializer instance used to read a buffer
     * @param {Number} size Size in bytes or Count of elements for Arrays
     * @returns {Property} Returns `this` instance
     */
    deserialize(serial, size) {
        throw new Error(`Deserialization not implemented for property: ${this.Type}`);
    }
    /**
     * Per-property serialization function
     * @returns {Buffer} Returns a `Buffer` of the serialized data
     */
    serialize() {
        throw new Error(`Serialization not implemented for property: ${this.Type}`);
    }
    /**
     * Factory function for a `Property` type. This should instantiate a `new Property` with default values if not given in the `json`
     * @param {Object} json Template from which to create a new instance of a `Property`
     */
    static from(json) {
        throw new Error(`from() not implemented for property: ${this.Type}`);
    }
}
