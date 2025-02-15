import { Property } from './'
import { PropertyFactory } from '../factories';
import { Serializer } from '../Serializer';

export class StructProperty extends Property {
    constructor() {
        super();
        this.StoredPropertyType = "";
        this.Properties = [];
    }
    get Size() {
        let size = this.Name.length + 1 + 4;
        size += this.Type.length + 1 + 4;
        size += 8; // 4 byte size + 4 byte padding
        size += this.StoredPropertyType.length + 1 + 4;
        size += 17; // 17 byte padding
        for (let i = 0; i < this.Properties.length; i++) {
            size += this.Properties[i].Size;
        }
        return size;
    }
    get HeaderSize() {
        let size = this.Name.length + 1 + 4;
        size += this.Type.length + 1 + 4;
        size += 8;
        size += this.StoredPropertyType.length + 1 + 4;
        size += 17;
        return size
    }
    get Count() {
        return this.Properties.length;
    }
    deserialize(serial, size) {
        // console.log(`Deserializing ${this.Name} Size: ${size}`)
        serial.seek(4);
        this.StoredPropertyType = serial.readString();
        serial.seek(17);
        let end = serial.tell + size;
        let i = 0;
        while (serial.tell < end) {
            let Name = this.StoredPropertyType;
            let Type = 'Tuple';
            let prop = PropertyFactory.create({ Name, Type })
            prop.deserialize(serial)
            this.Properties.push(prop);
            i++;
        }
        // console.log(`Done Deserializing ${this.Name} Offset: ${serial.tell}`)
        return this;
    }
    serialize() {
        let serial = Serializer.alloc(this.Size);
        serial.writeString(this.Name);
        serial.writeString(this.Type);
        serial.writeInt32(this.Size - this.HeaderSize);
        serial.seek(4);
        serial.writeString(this.StoredPropertyType);
        serial.seek(17);
        for (let i = 0; i < this.Properties.length; i++) {
            serial.write(this.Properties[i].serialize());
        }
        if (serial.tell !== this.Size)
            throw new SerializationError(this);
        return serial.Data;
    }
    static from(obj) {
        let struct = new StructProperty();
        struct.Name = obj.Name;
        struct.Type = obj.Type;
        struct.StoredPropertyType = obj.StoredPropertyType;
        struct.Properties = [];
        if (obj.Properties !== undefined)
            obj.Properties.forEach((prop) => struct.Properties.push(PropertyFactory.create(prop)));
        return struct;
    }
}
