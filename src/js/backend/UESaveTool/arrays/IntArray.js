import { Property } from '../properties/'
import { PropertyFactory } from '../factories'
import { SerializationError } from '..';
import { Serializer } from '../Serializer';

export class IntArray extends Property {
    constructor() {
        super();
        this.Type = "IntProperty"
        this.Properties = [];
    }
    get Size() {
        let size = this.Properties.length * 4;
        this.Properties.forEach((int) => {
            size += int.Size
        });
        return size;
    }
    get Count() {
        return this.Properties.length;
    }
    deserialize(serial, count) {
        serial.seek(count * 4);
        for (let i = 1; i < count; i++) {
            let Name = serial.readString();
            let Type = serial.readString();
            let Size = serial.readInt32();
            let prop = PropertyFactory.create({ Name, Type });
            prop.deserialize(serial);
            this.Properties.push(prop);
        }
        return this;
    }
    serialize() {
        let serial = Serializer.alloc(this.Size);
        serial.seek(this.Count * 4);
        this.Properties.forEach(int => serial.write(int.serialize()))
        if (serial.tell !== this.Size)
            throw new SerializationError(this);
        return serial.Data;
    }
    static from(obj) {
        let array = new IntArray();
        if (obj.Properties !== undefined)
            obj.Properties.forEach(int => array.Properties.push(PropertyFactory.create(int)));
        return array;
    }
}