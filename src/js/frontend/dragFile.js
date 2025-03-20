// dragDrop.js
import { analyzeFileToDatabase } from "../backend/UESaveHandler";
import { setDatabase, queryDB } from "../backend/dbManager.js";
import { gamePill, editorPill, setSaveName, new_update_notifications, setIsShowingNotification } from "./renderer.js";
import { Command } from "../backend/command.js";

let carAnalysisUtils = null;
export const dbWorker = new Worker(new URL('../backend/worker.js', import.meta.url));

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
    if (file.name.split('.').pop() === "vdf") {
        console.error("File not supported");
        new_update_notifications(
            'File type not supported. See <a href="https://www.youtube.com/watch?v=w-USlPQxZm0" target="_blank">this video</a> to find your save file.',
            "error"
        );
        return;
    }
    else if (file.name.split('.').pop() === "sav") {
        const footerNotification = document.querySelector('.footer-notification');
        if (footerNotification.classList.contains('error')) {
            console.log("has error")
            footerNotification.classList.remove('show');
            setIsShowingNotification(false);
        }
        setSaveName(file.name);
        if (!file) return;


        await new Promise((resolve, reject) => {
            dbWorker.postMessage(
                { command: 'loadDB', data: { file: file } },
            );

            dbWorker.onmessage = (msg) => {
                if (msg.data.responseMessage === "Database loaded") {
                    console.log("[Main Thread] Database loaded in Worker");
                    const dateObj = new Date(msg.data.content);
                    const day = dateObj.getDate();
                    //get month in text
                    const month = new Intl.DateTimeFormat('en-US', { month: 'long' }).format(dateObj);
                    const year = dateObj.getFullYear();
                    //get the day with the st. nd. rd. th. suffix
                    const completeDay = day + (day % 10 == 1 && day != 11 ? "st" : day % 10 == 2 && day != 12 ? "nd" : day % 10 == 3 && day != 13 ? "rd" : "th");
                    document.querySelector("#dateDay").textContent = completeDay;
                    document.querySelector("#dateMonth").textContent = month;
                    document.querySelector("#dateYear").textContent = year;
                    resolve();  // Continuamos cuando la base de datos esté cargada
                } else if (msg.data.error) {
                    console.error("[Main Thread] Error loading DB:", msg.data.error);
                    reject(new Error(msg.data.error));
                }
            };
        });

        document.getElementById("saveFileDropped").classList.add("completed");
        editorPill.classList.remove("d-none");
        gamePill.classList.remove("d-none");


        const command = new Command("saveSelected", {});
        command.execute();
    }
});



