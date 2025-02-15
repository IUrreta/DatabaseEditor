export class SerializationError extends Error {
    constructor(prop) {
        super(`Problem occurred during serialization of Property: ${prop.Name}`);
    }
}

export class DeserializationError extends Error {
    constructor(type, offset) {
        super(`Problem occurred during deserialization of Property '${type}' at offset 0x${offset.toString(16)}`)
    }
}

export class TypeNotImplementedError extends Error {
    constructor(type) {
        super(`No implementation for Property type: '${type}'`);
    }
}
