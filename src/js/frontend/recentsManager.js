import { get, set } from 'idb-keyval';

const DB_NAME = "SaveEditorDB";
const STORE_NAME = "recentFileHandles";
const DB_VERSION = 1; 

function openDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onupgradeneeded = (e) => {
            const db = e.target.result;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME, { keyPath: "name" });
            }
        };
        request.onsuccess = (e) => resolve(e.target.result);
        request.onerror = (e) => reject("Error opening DB");
    });
}

export async function saveHandleToRecents(handle) {
    let recents = (await get('recentFiles')) || [];
    
    recents = recents.filter(r => r.name !== handle.name);
    
    recents.unshift({
        name: handle.name,
        handle: handle, 
        lastOpened: new Date()
    });

    await set('recentFiles', recents);
}

export async function getRecentHandles() {
    return (await get('recentFiles')) || [];
}