// dragDrop.js
import { analyzeFileToDatabase } from "../backend/UESaveHandler";
import { setDatabase, queryDB } from "../backend/dbManager.js";
import { factory, setSaveName } from "./renderer.js";

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
    console.log(file)
    setSaveName(file.name);
    if (!file) return;


    await new Promise((resolve, reject) => {
        dbWorker.postMessage(
            { command: 'loadDB', data: { file: file } },
        );

        dbWorker.onmessage = (msg) => {
            if (msg.data.responseMessage === "Database loaded") {
                console.log("[Main Thread] Database loaded in Worker");
                resolve();  // Continuamos cuando la base de datos esté cargada
            } else if (msg.data.error) {
                console.error("[Main Thread] Error loading DB:", msg.data.error);
                reject(new Error(msg.data.error));
            }
        };
    });

    document.getElementById("saveFileDropped").classList.add("completed");

    const message = { command: 'saveSelected', data: { selectedData: "Hola", prueba2: "Hola mola" } };
    const command = factory.createCommand(message);
    command.execute();
});



