import {Gvas, Serializer} from "./UESaveTool";
import './initSql.js'; 
import pako from "pako";
import { saveAs } from "file-saver";
import { Buffer } from "buffer";

export const parseGvasProps = (Properties) => {
  const careerSaveMetadata = {};
  const metadataProperty = Properties.Properties.filter(x => x.Name === "MetaData")[0];
  const careerSaveMetadataProperty = metadataProperty.Properties[0];

  careerSaveMetadataProperty.Properties.forEach(prop => {
    careerSaveMetadata[prop.Name] = prop.Property || prop.Properties;
  })

  return { careerSaveMetadata };
}

export const analyzeFileToDatabase = async (file, SQL) => {
  return new Promise((resolve) => {
    if (file !== undefined) {
      let reader = new FileReader();
      reader.onload = async (e) => {
        const serial = new Serializer(Buffer.from(reader.result));
        const gvasMeta = new Gvas().deserialize(serial);
        const { Header, Properties } = gvasMeta;
        const { SaveGameVersion, EngineVersion } = Header;
        const { BuildId, Build } = EngineVersion;
        let version = 0, gameVersion, gameVersionWithBuild;
        switch (SaveGameVersion) {
          case 2:
            version = 2;
            gameVersion = BuildId.substring(BuildId.indexOf("22_") + 3);
            gameVersionWithBuild = `${gameVersion}.${Build & 0x7fffffff}`;
            break;
          case 3:
            if (BuildId.indexOf("volta23") !== -1) {
              version = 3;
              gameVersion = BuildId.substring(BuildId.indexOf("23+") + 3);
              gameVersionWithBuild = `${gameVersion}.${Build & 0x7fffffff}`;
            }
            if (BuildId.indexOf("volta24") !== -1) {
              version = 4;
              gameVersion = BuildId.substring(BuildId.indexOf("24+") + 8);
              gameVersionWithBuild = `${gameVersion}.${Build & 0x7fffffff}`;
            }
            break;
          default:
            version = 0;
        }


        const unk_zero = serial.readInt32();
        const total_size = serial.readInt32();
        const size_1 = serial.readInt32();
        const size_2 = serial.readInt32();
        const size_3 = serial.readInt32();

        const compressedData = serial.read(total_size);
        const output = pako.inflate(compressedData);
        const databaseFile = output.slice(0, size_1);


        const text = new TextDecoder().decode(databaseFile.slice(0, 16));

        // @ts-ignore

        const db = new SQL.Database(databaseFile);

        const metadata = {
          filename: file.name, // for in-app

          version,
          fullBuildId: BuildId,
          gameVersion,
          gameVersionWithBuild,

          databaseFile,

          gvasMeta,
          gvasHeader: Header, // read-only

          ...parseGvasProps(Properties),

          otherDatabases: [{
            size: size_2,
            file: output.slice(size_1, size_1 + size_2),
          }, {
            size: size_3,
            file: output.slice(size_1 + size_2, size_1 + size_2 + size_3),
          }]
        }

        if (process.env.NODE_ENV === 'development') {
          // saveAs(new Blob([metadata.chunk0], {type: "application/binary"}), "chunk0");
        }

        resolve({db, metadata});
      };
      reader.readAsArrayBuffer(file);
    }
  });
}

export const repack = (db, metadata, overwrite = false) => {
  const db_data = db.export();
  const db_size = db_data.length;

  const { otherDatabases, gvasMeta } = metadata;

  const s1 = otherDatabases[0].size;
  const s2 = otherDatabases[1].size;

  const compressedData = new Buffer(db_size + s1 + s2);
  compressedData.set(db_data, 0);
  compressedData.set(otherDatabases[0].file, db_size);
  compressedData.set(otherDatabases[1].file, db_size + s1);

  const compressed = pako.deflate(compressedData);
  const compressed_size = compressed.length;

  const serialized = gvasMeta.serialize();
  const meta_length = serialized.length;

  const check = new Gvas().deserialize(
    new Serializer(Buffer.from(serialized))
  );

  if (JSON.stringify(gvasMeta) === JSON.stringify(check)) {
    const finalData = new Buffer(meta_length + 16 + compressed_size);

    finalData.set(serialized, 0);
    finalData.writeInt32LE(compressed_size, meta_length);
    finalData.writeInt32LE(db_size, meta_length + 4);
    finalData.writeInt32LE(s1, meta_length + 8);
    finalData.writeInt32LE(s2, meta_length + 12);
    finalData.set(compressed, meta_length + 16);

    console.log("Repacked", finalData);

    return { finalData, metadata };

    saveAs(new Blob([finalData], {type: "application/binary"}), metadata.filename);
    
  } else {
    alert("Savefile Serialization Check failed.")
  }

}

export const dump = (db, metadata) => {
  saveAs(new Blob([db.export()], {type: "application/vnd.sqlite3"}), metadata.filename + ".db");
}