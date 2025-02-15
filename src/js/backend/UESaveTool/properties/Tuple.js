import { Property } from './'
import { PropertyFactory } from '../factories';
import { SerializationError } from '..';
import { Serializer } from '../Serializer';

export class Tuple extends Property {
    constructor() {
        super();
        this.Type = 'Tuple';
        this.Properties = [];
    }
    get Size() {
        let size = 0;
        for (let i = 0; i < this.Properties.length; i++) {
            size += this.Properties[i].Size;
        }
        size += 9;
        return size;
    }
    get Count() {
        return this.Properties.length;
    }
    deserialize(serial) {
        let Name;
        while ((Name = serial.readString()) !== 'None') {
            let Type = serial.readString();
            let Size = serial.readInt32();
            let prop = PropertyFactory.create({ Name, Type });
            prop.deserialize(serial, Size);
            this.Properties.push(prop);
        }
        return this;
    }
    serialize() {
        let serial = Serializer.alloc(this.Size);
        for (let i = 0; i < this.Properties.length; i++) {
            serial.write(this.Properties[i].serialize());
        }
        serial.writeString('None');
        if (serial.tell !== this.Size)
            throw new SerializationError(this);
        return serial.Data;
    }
    static from(obj) {
        let tuple = new Tuple();
        tuple.Name = obj.Name;
        if (obj.Properties !== undefined)
            obj.Properties.forEach(prop => tuple.Properties.push(PropertyFactory.create(prop)));
        return tuple;
    }
}