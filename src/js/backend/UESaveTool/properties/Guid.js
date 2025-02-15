import { Buffer } from 'buffer'
import { Property } from './'
import { SerializationError } from '..';
import { Serializer } from '../Serializer';

export class Guid extends Property {
    constructor() {
        super();
        this.Type = 'Guid';
        this.Id = "00000000-00-00-00-000000000000";
        this.Value = 0;
    }
    get Size() {
        return 20;
    }
    deserialize(serial) {
        this.Id = `${serial.read(4).swap32().toString('hex')}`
        this.Id += `-${serial.read(2).swap16().toString('hex')}`
        this.Id += `-${serial.read(2).swap16().toString('hex')}`
        this.Id += `-${serial.read(2).toString('hex')}`
        this.Id += `-${serial.read(6).toString('hex')}`
        this.Value = serial.readInt32();
        return this;
    }
    serialize() {
        let guid = this.Id.split('-');
        let serial = Serializer.alloc(this.Size);
        serial.write(Buffer.from(guid[0], 'hex').swap32());
        serial.write(Buffer.from(guid[1], 'hex').swap16());
        serial.write(Buffer.from(guid[2], 'hex').swap16());
        serial.write(Buffer.from(guid[3], 'hex'));
        serial.write(Buffer.from(guid[4], 'hex'));
        serial.writeInt32(this.Value);
        if (serial.tell !== 20)
            throw new SerializationError(this);
        return serial.Data;
    }
    static from(obj) {
        let guid = new Guid();
        guid.Id = obj.Id;
        guid.Value = obj.Value;
        return guid;
    }
}
