// dragDrop.js
import { gamePill, editorPill, setSaveName, new_update_notifications, setIsShowingNotification } from "./renderer.js";
import { saveHandleToRecents, getRecentHandles } from "./recentsManager.js";
import { Command } from "../backend/command.js";

let carAnalysisUtils = null;
export const dbWorker = new Worker(new URL('../backend/worker.js', import.meta.url));

const dropDiv = document.querySelector(".drop-div");
const statusCircle = document.getElementById("statusCircle");
const statusIcon = document.getElementById("statusIcon");
const statusTitle = document.getElementById("statusTitle");
const loadingSpinner = document.querySelector(".loading-spinner");
const statusDesc = document.getElementById("statusDesc");
const body = document.querySelector("body");

export const handleDragEnter = (event) => {
    event.preventDefault();
    body.classList.add("drag-active");
};

export const handleDragOver = (event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "copy";
};

export const handleDragLeave = (event) => {
    event.preventDefault();
    body.classList.remove("drag-active");
};

export const handleDrop = async (event) => {
    event.preventDefault();
    body.classList.remove("drag-active");

    const item = event.dataTransfer.items[0];
    
    // ... el resto de tu lógica de drop ...
    if (item && item.kind === 'file') {
        try {
            const handle = await item.getAsFileSystemHandle();
            
            if (handle) {
                await saveHandleToRecents(handle);
                const file = await handle.getFile();
                await processSaveFile(file)
            } else {
                const file = item.getAsFile();
                await processSaveFile(file);
            }
        } catch (e) {
            console.error("Error with file handle:", e);
            const file = event.dataTransfer.files[0];
            await processSaveFile(file);
        }
    }
};

dropDiv.addEventListener("dragenter", handleDragEnter);
dropDiv.addEventListener("dragover", handleDragOver);
dropDiv.addEventListener("dragleave", handleDragLeave);
dropDiv.addEventListener("drop", handleDrop);

const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));


export async function processSaveFile(file) {
    if (!file) return;

    // --- Validaciones de archivo ---
    if (file.name.split('.').pop() === "vdf") {
        console.error("File not supported");
        new_update_notifications(
            'File type not supported. See <a href="https://www.youtube.com/watch?v=w-USlPQxZm0" target="_blank">this video</a> to find your save file.',
            "error"
        );
        return;
    } else if (file.name.split('.').pop() === "sav") {
        
        const footerNotification = document.querySelector('.footer-notification');
        if (footerNotification && footerNotification.classList.contains('error')) {
            footerNotification.classList.remove('show');
            setIsShowingNotification(false);
        }
        
        setSaveName(file.name);

        // 1. Ponemos el icono en modo SPINNER
        await updateStatusUI('loading');

        // 2. Definimos la tarea de carga
        const dbLoadTask = new Promise((resolve, reject) => {
            dbWorker.postMessage({ command: 'loadDB', data: { file: file } });

            dbWorker.onmessage = (msg) => {
                if (msg.data.responseMessage === "Database loaded") {
                    console.log("[Main Thread] Database loaded in Worker");
                    const dateObj = new Date(msg.data.content);
                    const day = dateObj.getDate();
                    const month = new Intl.DateTimeFormat('en-US', { month: 'long' }).format(dateObj);
                    const year = dateObj.getFullYear();
                    const completeDay = day + (day % 10 == 1 && day != 11 ? "st" : day % 10 == 2 && day != 12 ? "nd" : day % 10 == 3 && day != 13 ? "rd" : "th");
                    
                    document.querySelector("#dateDay").textContent = completeDay;
                    document.querySelector("#dateMonth").textContent = month;
                    document.querySelector("#dateYear").textContent = year;
                    
                    resolve(); 
                } else if (msg.data.error) {
                    console.error("[Main Thread] Error loading DB:", msg.data.error);
                    reject(new Error(msg.data.error));
                }
            };
        });

        // 3. Ejecutamos: Carga + Espera
        try {
            await Promise.all([
                dbLoadTask,
                wait(2000)
            ]);

            // 4. Ponemos el icono en modo CHECK VERDE
            await updateStatusUI('success', { filename: file.name });

            // 5. Esperamos 1 segundo extra
            await wait(1000);

            // 6. Finalmente mostramos el editor
            editorPill.classList.remove("d-none");
            gamePill.classList.remove("d-none");
            patreonPill.classList.remove("d-none");

            const command = new Command("saveSelected", {});
            command.execute();

            document.querySelector(".script-selector").classList.remove("hidden");
            document.querySelector(".footer").classList.remove("hidden");

        } catch (error) {
            console.error("Error en el proceso:", error);
            // Aquí podrías manejar el error visualmente si quisieras
        }
    }
}


async function updateStatusUI(type, textConfig) {
    statusIcon.classList.add("icon-scale-0");
    
    await wait(170);

    if (type === 'loading') {
        loadingSpinner.classList.add("show");
        
        statusTitle.textContent = "Analyzing database...";
        statusDesc.innerText = "This may take a few seconds.";
        
    } else if (type === 'success') {
        loadingSpinner.classList.remove("show");
        // Cambiar icono a Check y Colores
        statusIcon.className = "bi bi-check-lg"; // Volvemos a poner clase de icono
        statusIcon.classList.add("success-mode"); // Color verde al icono
        statusCircle.classList.add("success-mode"); // Fondo verde al circulo
        
        // Textos
        statusTitle.textContent = "Save loaded successfully!";
        statusDesc.innerText = textConfig.filename;

        await wait(50); 
        statusIcon.classList.remove("icon-scale-0");
    }
    
    
}
