// dragDrop.js
import { analyzeFileToDatabase } from "../backend/UESaveHandler";
import { setDatabase } from "../backend/dbManager.js";
import { factory } from "./renderer.js";
import DBUtils from "../backend/dbUtils.js";

let dbUtils = null;

const blockDiv = document.getElementById("blockDiv");

blockDiv.addEventListener("dragenter", (event) => {
    event.preventDefault();
    blockDiv.classList.add("drag-over");
});

blockDiv.addEventListener("dragover", (event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "copy";
});

blockDiv.addEventListener("dragleave", (event) => {
    event.preventDefault();
    blockDiv.classList.remove("drag-over");
});

blockDiv.addEventListener("drop", async (event) => {
    event.preventDefault();
    blockDiv.classList.remove("drag-over");

    const file = event.dataTransfer.files[0];
    if (!file) return;

    try {
        console.log("Leyendo el archivo:", file.name);
        const { db, metadata } = await analyzeFileToDatabase(file);

        setDatabase(db, metadata);
        dbUtils = new DBUtils(db, metadata);
        console.log("DB y metadata guardados");

        console.log("¡File readed succesfuly!", metadata);


        const tables = db.exec("SELECT name FROM sqlite_master WHERE type='table'");
        console.log("All tables:", tables);

        const message = { command: 'saveSelected', data: { selectedData: "Hola", prueba2: "Hola mola" } };
        const command = factory.createCommand(message);

        console.log("Command created:", command);
        command.execute();

    } catch (error) {
        console.error("Error al leer el archivo:", error);
    }
});

export function getDBUtils() {
    if (!dbUtils) {
        throw new Error("La base de datos aún no se ha inicializado.");
    }
    return dbUtils;
}