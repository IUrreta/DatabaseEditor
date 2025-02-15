import { Serializer } from '../Serializer';
import { SerializationError } from '../PropertyErrors';
import { Property } from './'

export class FloatProperty extends Property {
    constructor() {
        super();
        this.Property = 0;
        this.Index = 0;
    }
    get Size() {
        return this.Name.length + 1 + 4
            + this.Type.length + 1 + 4
            + 13;
    }
    deserialize(serial) {
        this.Index = serial.readInt32();
        serial.seek(1);
        this.Property = serial.readFloat();
        return this;
    }
    serialize() {
        let serial = Serializer.alloc(this.Size);
        serial.writeString(this.Name);
        serial.writeString(this.Type);
        serial.writeInt32(4);
        serial.writeInt32(this.Index);
        serial.seek(1);
        serial.writeFloat(this.Property);
        if (serial.tell !== this.Size)
            throw new SerializationError(this);
        return serial.Data;
    }
    static from(obj) {
        let prop = new FloatProperty();
        obj.Property = Number(obj.Property);
        Object.assign(prop, obj);
        return prop;
    }
}
