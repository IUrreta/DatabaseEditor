import {SerializationError} from "../PropertyErrors";
import {Serializer} from '../Serializer';
import {Property} from './'

const is8Bit = string => /^[\x00-\xFF]*$/.test(string);

export class StrProperty extends Property {
    constructor() {
        super();
        this.Property = "";
        this.Encoding = "latin1";
    }

    get Encoding() {
        return is8Bit(this.Property) ? "latin1" : "utf16le";
    }

    get StringEncodedLength() {
        return Buffer.from(this.Property + "\0", this.Encoding).length;
    }

    get Size() {
        const baseLength = this.Name.length + 1 + 4 + this.Type.length + 1 + 4;
        return baseLength + this.StringEncodedLength + 4 + 9;
    }
    deserialize(serial) {
        serial.seek(5);
        [this.Property, this.Encoding] = serial.readUnicodeString();
        return this;
    }
    serialize() {
        let serial = Serializer.alloc(this.Size);
        serial.writeString(this.Name);
        serial.writeString(this.Type);

        serial.writeInt32(this.StringEncodedLength + 4);
        serial.seek(5);
        switch (this.Encoding) {
            case "latin1":
                serial.writeInt32(this.StringEncodedLength);
                serial.writeLatin1String(this.Property);
                break;
            case "utf16le":
                serial.writeInt32(-(this.StringEncodedLength / 2));
                serial.writeUTF16String(this.Property);
                break;
        }
        if (serial.tell !== this.Size)
            throw new SerializationError(this);
        return serial.Data;
    }
    static from(obj) {
        let prop = new StrProperty();
        if (obj.Encoding === "utf8") {
            obj.Encoding = "latin1";
            console.warn("utf8 should be latin1");
        }

        if (obj.Encoding === "latin1") {
            if (!is8Bit(obj.Property)) {
                throw Error(`${obj.Name} = ${obj.Property} is outside latin1. consider using utf16le?`)
            }
        } else if (obj.Encoding === "utf16le") {
        } else if (!obj.Encoding) {
        } else {
            throw Error(`${obj.Name}: ${obj.Encoding} is unsupported. valid options are: [latin1, utf16le]`)
        }
        Object.assign(prop, obj);
        return prop;
    }
}
