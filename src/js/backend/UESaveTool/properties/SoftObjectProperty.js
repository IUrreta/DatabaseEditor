import { SerializationError } from '../PropertyErrors';
import { Property } from './'
import { Serializer } from '../Serializer';

export class SoftObjectProperty extends Property {
    constructor() {
        super();
        this.Property = "";
    }
    get Size() {
        return this.Name.length + 1 + 4
            + this.Type.length + 1 + 4
            + this.Property.length + 1 + 4
            + 13;
    }
    deserialize(serial) {
        serial.seek(5);
        this.Property = serial.readString();
        serial.seek(4);
        return this;
    }
    serialize() {
        let serial = Serializer.alloc(this.Size);
        serial.writeString(this.Name);
        serial.writeString(this.Type);
        serial.writeInt32(this.Property.length + 8);
        serial.seek(5);
        serial.writeString(this.Property);
        serial.seek(4);
        if (serial.tell !== this.Size)
            throw new SerializationError(this);
        return serial.Data;
    }
    static from(obj) {
        let prop = new SoftObjectProperty();
        Object.assign(prop, obj);
        return prop;
    }
}
