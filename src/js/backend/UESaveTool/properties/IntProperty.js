import { Property } from './'
import { Serializer } from '..';
import { SerializationError } from '../PropertyErrors';

export class IntProperty extends Property {
    constructor() {
        super();
        this.Property = 0;
        this.Index = 0;
    }
    get Size() {
        return this.Name.length + 1 + 4
            + this.Type.length + 1 + 4
            + 9 + 4;
    }
    deserialize(serial) {
        this.Index = serial.readInt32();
        serial.seek(1);
        this.Property = serial.readInt32();
        return this;
    }
    serialize() {
        let serial = Serializer.alloc(this.Size);
        serial.writeString(this.Name);
        serial.writeString(this.Type);
        serial.writeInt32(4);
        serial.writeInt32(this.Index);
        serial.seek(1);
        serial.writeInt32(this.Property);
        if (serial.tell !== this.Size)
            throw new SerializationError(this);
        return serial.Data;
    }
    static from(obj) {
        let prop = new IntProperty();
        obj.Property = obj.Property || 0;
        const lb = -1 << 31;
        const ub = 0x7fffffff;
        if (obj.Property > ub || obj.Property < lb) {
            throw Error(`${obj.Name} = ${obj.Property} out of range [${lb}, ${ub}]`)
        }
        Object.assign(prop, obj);
        return prop;
    }
}

export class UInt32Property extends Property {
    constructor() {
        super();
        this.Property = 0;
        this.Index = 0;
    }
    get Size() {
        return this.Name.length + 1 + 4
            + this.Type.length + 1 + 4
            + 9 + 4;
    }
    deserialize(serial) {
        this.Index = serial.readInt32();
        serial.seek(1);
        this.Property = serial.readUInt32();
        return this;
    }
    serialize() {
        let serial = Serializer.alloc(this.Size);
        serial.writeString(this.Name);
        serial.writeString(this.Type);
        serial.writeInt32(4);
        serial.writeInt32(this.Index);
        serial.seek(1);
        serial.writeUInt32(this.Property);
        if (serial.tell !== this.Size)
            throw new SerializationError(this);
        return serial.Data;
    }
    static from(obj) {
        let prop = new IntProperty();
        obj.Property = obj.Property || 0;
        const lb = 0;
        const ub = 0xffffffff;
        if (obj.Property > ub || obj.Property < lb) {
            throw Error(`${obj.Name} = ${obj.Property} out of range [${lb}, ${ub}]`)
        }
        Object.assign(prop, obj);
        return prop;
    }
}
