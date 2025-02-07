// dragDrop.js
import { analyzeFileToDatabase } from "../backend/UESaveHandler";
import { setDatabase, queryDB } from "../backend/dbManager.js";
import { factory } from "./renderer.js";

let carAnalysisUtils = null;
export const dbWorker = new Worker(new URL('../backend/commands/worker.js', import.meta.url));

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

    const { db, metadata } = await analyzeFileToDatabase(file);

    const dbBinary = db.export();

    setDatabase(db, metadata);


    dbWorker.postMessage(
        { action: 'loadDB', buffer: dbBinary },
        [dbBinary.buffer] // Marcamos el ArrayBuffer interno como transferible
    );

    document.getElementById("saveFileDropped").classList.add("completed");


    const tables = db.exec("SELECT name FROM sqlite_master WHERE type='table'");
    console.log("All tables:", tables);

    const message = { command: 'saveSelected', data: { selectedData: "Hola", prueba2: "Hola mola" } };
    const command = factory.createCommand(message);

    command.execute();


});


