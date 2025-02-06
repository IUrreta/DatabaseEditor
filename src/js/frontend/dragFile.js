// dragDrop.js
import { analyzeFileToDatabase } from "../backend/UESaveHandler";
import { setDatabase, queryDB } from "../backend/dbManager.js";
import { factory } from "./renderer.js";
import DBUtils from "../backend/scriptUtils/dbUtils.js";

let dbUtils = null;
let carAnalysisUtils = null;

const dropDiv = document.getElementById("dropDiv");

dropDiv.addEventListener("dragenter", (event) => {
    event.preventDefault();
    dropDiv.classList.add("drag-over");
});

dropDiv.addEventListener("dragover", (event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "copy";
});

dropDiv.addEventListener("dragleave", (event) => {
    event.preventDefault();
    dropDiv.classList.remove("drag-over");
});

dropDiv.addEventListener("drop", async (event) => {
    event.preventDefault();
    dropDiv.classList.remove("drag-over");

    const file = event.dataTransfer.files[0];
    if (!file) return;

    console.log("Leyendo el archivo:", file.name);
    const { db, metadata } = await analyzeFileToDatabase(file);

    setDatabase(db, metadata);
    dbUtils = new DBUtils(queryDB, metadata);
    console.log("DB y metadata guardados");

    console.log("¡File readed succesfuly!", metadata);

    document.getElementById("saveFileDropped").classList.add("completed");


    const tables = db.exec("SELECT name FROM sqlite_master WHERE type='table'");
    console.log("All tables:", tables);

    const message = { command: 'saveSelected', data: { selectedData: "Hola", prueba2: "Hola mola" } };
    const command = factory.createCommand(message);

    console.log("Command created:", command);
    command.execute();


});

export function getDBUtils() {
    if (!dbUtils) {
        throw new Error("La base de datos aún no se ha inicializado.");
    }
    return dbUtils;
}
