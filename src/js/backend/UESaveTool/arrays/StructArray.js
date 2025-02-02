import { StructProperty } from "../properties/index.js";
import { PropertyFactory } from "../index.js";

export class StructArray extends StructProperty {
    deserialize(serial, count) {
        // console.log(`Deserializing ${this.Name} Count: ${count}`)
        this.Name = serial.readString()
        this.Type = serial.readString()
        let Size = serial.readInt32();
        serial.seek(4);
        this.StoredPropertyType = serial.readString();
        serial.seek(17);
        let i = 0;
        while (i < count) {
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
    static from(obj) {
        let struct = new StructArray();
        struct.Name = obj.Name;
        struct.Type = obj.Type;
        struct.StoredPropertyType = obj.StoredPropertyType;
        struct.Properties = [];
        if (obj.Properties !== undefined)
            obj.Properties.forEach((prop) => struct.Properties.push(PropertyFactory.create(prop)));
        return struct;
    }
}