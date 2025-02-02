import {SerializationError} from '.';
import {PropertyFactory} from './factories';
import {Serializer} from './Serializer';

export class GvasHeader {
    constructor() {
        this.Format = 'GVAS';
        this.SaveGameVersion = 0;
        this.PackageVersion = 0;
        this.PackageFileVersionUE5 = 0;
        this.EngineVersion = {
            Major: 0,
            Minor: 0,
            Patch: 0,
            Build: 0,
            BuildId: ""
        }
        this.CustomFormatVersion = 0;
        this.CustomFormatData = {
            Count: 0,
            Entries: []
        }
        this.SaveGameClassName = "";
    }
    get Size() {
        let size = this.Format.length;
        size += 18;

        size += this.EngineVersion.BuildId.length + 1 + 4;
        if (this.EngineVersion.Major >= 5) {
            size += 4;
        }
        size += 8;
        this.CustomFormatData.Entries.forEach(guid => {
            size += guid.Size; // 20
        })
        size += this.SaveGameClassName.length + 1 + 4;
        return size;
    }
    deserialize(serial) {
        /* 5.3: https://github.com/EpicGames/UnrealEngine/blob/5.3/Engine/Source/Runtime/Engine/Private/GameplayStatics.cpp#L85 */

        // FileTypeTag: GVAS
        this.SaveGameVersion = serial.readInt32();
        this.PackageVersion = serial.readInt32();
        if (this.SaveGameVersion >= 3) {
            this.PackageFileVersionUE5 = serial.readInt32();
            /* this needs to be larger than 1000 */
        }
        /*
            3 means PackageFileSummaryVersionChange, rather than F1M 2023
            https://github.com/EpicGames/UnrealEngine/blob/5.3/Engine/Source/Runtime/Engine/Private/GameplayStatics.cpp#L93
        */
        this.EngineVersion.Major = serial.readUInt16();
        this.EngineVersion.Minor = serial.readUInt16();
        this.EngineVersion.Patch = serial.readUInt16();
        this.EngineVersion.Build = serial.readUInt32();
        this.EngineVersion.BuildId = serial.readString();

        this.CustomFormatVersion = serial.readInt32();
        this.CustomFormatData.Count = serial.readInt32();
        for (let i = 0; i < this.CustomFormatData.Count; i++) {
            let guid = PropertyFactory.create({ Type: 'Guid' })
            this.CustomFormatData.Entries.push(guid.deserialize(serial));
        }
        this.SaveGameClassName = serial.readString();
        return this;
    }
    serialize() {
        let serial = Serializer.alloc(this.Size);
        serial.write(Buffer.from(this.Format));
        serial.writeInt32(this.SaveGameVersion);
        serial.writeInt32(this.PackageVersion);
        if (this.SaveGameVersion >= 3) {
            serial.writeInt32(this.PackageFileVersionUE5);
        } // UE 5 for F1M 23

        serial.writeUInt16(this.EngineVersion.Major);
        serial.writeUInt16(this.EngineVersion.Minor);
        serial.writeUInt16(this.EngineVersion.Patch);
        serial.writeUInt32(this.EngineVersion.Build);
        serial.writeString(this.EngineVersion.BuildId);

        serial.writeInt32(this.CustomFormatVersion);
        serial.writeInt32(this.CustomFormatData.Count);
        this.CustomFormatData.Entries.forEach(guid => serial.write(guid.serialize()));
        serial.writeString(this.SaveGameClassName);
        if (serial.tell != this.Size)
            throw new SerializationError(this);
        return serial.Data;
    }
    static from(obj) {
        let header = new GvasHeader();
        header.SaveGameVersion = obj.SaveGameVersion;
        header.PackageVersion = obj.PackageVersion;
        header.EngineVersion = obj.EngineVersion;
        header.CustomFormatVersion = obj.CustomFormatVersion;
        header.CustomFormatData.Count = obj.CustomFormatData.Count;
        obj.CustomFormatData.Entries.forEach(guid => {
            header.CustomFormatData.Entries.push(PropertyFactory.create(guid));
        });
        header.SaveGameClassName = obj.SaveGameClassName;
        return header;
    }
}