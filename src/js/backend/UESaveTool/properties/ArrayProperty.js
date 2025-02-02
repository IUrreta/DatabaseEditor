import { Buffer } from 'buffer'
import { Property } from './'
import { PropertyFactory } from '../factories';
import { SerializationError } from '../'
import { Serializer } from '../Serializer';

export class ArrayProperty extends Property {
    constructor() {
        super();
        this.StoredPropertyType = "";
        this.Property = new Property();
    }
    get Size() {
        let size = 0;
        size += this.Name.length + 1 + 4;
        size += this.Type.length + 1 + 4;
        size += 8; // 4 byte size + 4 byte padding
        size += this.StoredPropertyType.length + 1 + 4;
        size += 5; // 1 byte padding + 2 byte int + 2 byte padding
        size += this.Property.Size;
        return size;
    }
    get HeaderSize() {
        let size = this.Name.length + 1 + 4;
        size += this.Type.length + 1 + 4;
        size += 8;
        size += this.StoredPropertyType.length + 1 + 4;
        size += 1;
        return size;
    }
    get ArraySize() {
        if (this.StoredPropertyType === 'IntProperty')
            return 12;
        else
            return this.Size - this.HeaderSize;
    }
    deserialize(serial) {
        serial.seek(4);
        this.StoredPropertyType = serial.readString()
        serial.seek(1);
        let count = serial.readInt16();
        serial.seek(2);
        this.Property = PropertyFactory.createArray({
            Name: this.Name,
            Type: this.StoredPropertyType
        });
        this.Property.deserialize(serial, count)

        return this;
    }
    serialize() {
        let serial = Serializer.alloc(this.Size);
        serial.writeString(this.Name);
        serial.writeString(this.Type);
        serial.writeInt32(this.ArraySize);
        serial.seek(4);
        serial.writeString(this.StoredPropertyType);
        serial.seek(1);
        serial.writeInt16(this.Property.Count);
        serial.seek(2);
        serial.write(this.Property.serialize());
        if (serial.tell !== this.Size)
            throw new SerializationError(this);
        return serial.Data;
    }
    static from(obj) {
        let array = new ArrayProperty();
        array.Name = obj.Name;
        array.Type = obj.Type;
        array.StoredPropertyType = obj.StoredPropertyType;
        if (obj.Property !== undefined)
            array.Property = PropertyFactory.createArray(obj.Property);
        return array;
    }
}