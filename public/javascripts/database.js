import * as idb from './idb/index.js';

let db;

const DB_NAME= 'db_data_1';
const STORE_NAME= 'data';

/**
 * it inits the database
 */
async function initDatabase(){
    if (!db) {
        db = await idb.openDB(DB_NAME, 2, {
            upgrade(upgradeDb, oldVersion, newVersion) {
                if (!upgradeDb.objectStoreNames.contains(STORE_NAME)) {

                    var idb = upgradeDb.createObjectStore(STORE_NAME, { keyPath: "id", autoIncrement: true });
                    idb.createIndex('image', 'image', {unique: false});
                    idb.createIndex('room', 'room', {unique: false});
                    idb.createIndex('annotations', 'annotations', {unique: false});
                    idb.createIndex('chat', 'chat', {unique: false});

                }
            }
        });
        console.log('db created');
    }
}

window.initDatabase= initDatabase;
/**
 * Add image and room data to index db the first time a room/image combination is used
 * @param data Object containing image in base64 format, room number and empty arrays for
 *              annotations and chat.
 */
async function addData(data) {
    console.log('Store Image: '+JSON.stringify(data));
    if (!db)
        await initDatabase();
    if (db) {
        try{
            let tx = await db.transaction(STORE_NAME, 'readwrite');
            let store = await tx.objectStore(STORE_NAME);
            let obj = await search('image', data.image, data.room, store);


            console.log(obj.id);

            if(!obj){
                await store.put(data);
            }
            if(obj){
                store.delete(obj.id);
                let annotations = obj.annotations;
                let chat = obj.chat;

                await store.put(data);
                console.log(annotations);
                for(let i = 1; i < annotations.length; i++){
                    /*
                    console.log("---------------------------------------------------------------")
                    console.log("canvasWidth in arr: "+ annotations[i][0]);
                    console.log("canvasHeight in arr: "+annotations[i][1]);
                    console.log("PrevX in arr: "+ annotations[i][2]);
                    console.log("prevY in arr: "+annotations[i][3]);
                    console.log("currX in arr: "+annotations[i][4]);
                    console.log("currY in arr: "+annotations[i][5]);
                    console.log("color in arr: "+annotations[i][6]);
                    console.log("thickness in arr: "+annotations[i][7]);
                    console.log("---------------------------------------------------------------")

                     */

                    drawOnCanvas(imageBase, ctx, parseInt(annotations[i][0]), parseInt(annotations[i][1]), parseInt(annotations[i][2]), annotations[i][3], annotations[i][4], annotations[i][5], annotations[i][6], annotations[i][7]);
                }
                for(let i = 0; i < chat.length; i++){
                    writeOnHistory(chat[i]);
                }

                await  tx.done;
            }




        } catch(error) {
            console.log(error)
            localStorage.setItem(data.image + "-"+data.room, JSON.stringify(data));
        };
    }
    else localStorage.setItem(data.image + "-"+data.room, JSON.stringify(data));
}
window.addData= addData

/**
 * Add annotations/chat messages to IndexedDB
 * @param name Either annotations or char
 * @param data The data to be added to the IndexedDb record
 * @param image The image being used in the chat room
 * @param room The room number
 */
async function storeOther(name, data, image, room) {
    if (!db)
        await initDatabase();
    if (db) {
        try{
            let tx = await db.transaction(STORE_NAME, 'readwrite');
            let store = await tx.objectStore(STORE_NAME);

            let obj = await search(name, image, room.value, store);
            if(obj){
                if(name === 'annotations') {
                    obj.annotations.push(data);
                }
                else{
                    obj.chat.push(data);
                }
                await store.put(obj);
            }
            await tx.done;

        } catch(error) {
            console.log(error);
            localStorage.setItem(data.image + "-"+data.room, JSON.stringify(data));
        };
    }
    else localStorage.setItem(data.image + "-"+data.room, JSON.stringify(data));
}
window.storeOther= storeOther


/**
 * Search to see if a particular image/room combination exists within IndexedDb
 * @param name Name of the index being used to search
 * @param image Image to find within the IndexedDB
 * @param Room to find within the IndexedDB
 * @returns {*} If the specified record exists in the database, the record will be returned. Returns
 *              false if the record is not found
 */
async function search(name, image, room, store) {
    if (!db)
        await initDatabase();
    if (db) {
        try{
            let index = await store.index(name);
            let readingsList = await index.getAll();
            let obj;

            for (let elem of readingsList) {
                if (elem.image === image && elem.room === room){
                    return(elem);
                }
            }
            return false;


        } catch(error) {
            console.log(error);
        };
    }

}
window.search= search;




