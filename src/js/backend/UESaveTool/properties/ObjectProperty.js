import { Serializer } from '../Serializer';
import { SerializationError } from '../PropertyErrors';
import { Property } from './'

export class ObjectProperty extends Property {
    constructor() {
        super();
        this.Property = "";
    }
    get Size() {
        return this.Name.length + 1 + 4
            + this.Type.length + 1 + 4
            + this.Property.length + 1 + 4
            + 9;
    }
    deserialize(serial) {
        serial.seek(5);
        this.Property = serial.readString();
        return this;
    }
    serialize() {
        let serial = Serializer.alloc(this.Size);
        serial.writeString(this.Name);
        serial.writeString(this.Type);
        serial.writeInt32(this.Property.length + 1 + 4);
        serial.seek(5);
        serial.writeString(this.Property);
        if (serial.tell !== this.Size)
            throw new SerializationError(this);
        return serial.Data;
    }
    static from(obj) {
        let prop = new ObjectProperty();
        Object.assign(prop, obj);
        return prop;
    }
}
