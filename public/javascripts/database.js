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
                    idb.createIndex('knowledge', 'knowledge', {unique: false});
                    idb.createIndex('previousImage', 'previousImage', {unique: false});
                    idb.createIndex('nextImage', 'nextImage', {unique: false});



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
    if (!db)
        await initDatabase();
    if (db) {
        try{
            let tx = await db.transaction(STORE_NAME, 'readwrite');
            let store = await tx.objectStore(STORE_NAME);
            let obj = await search('image', data.image, data.room, store);

            if(obj){
                store.delete(obj.id);
                let annotations = obj.annotations;
                let chat = obj.chat;
                let knowledge = obj.knowledge;
                let prev = obj.previousImage;
                let next = obj.nextImage;

                if(next) {
                    data.nextImage = next;
                }
                if(prev) {
                    data.previousImage = prev;
                }


                await store.put(data);
                for(let i = 0; i < annotations.length; i++){
                    drawOnCanvas(imageBase, ctx, parseInt(annotations[i][0]), parseInt(annotations[i][1]), parseInt(annotations[i][2]), annotations[i][3], annotations[i][4], annotations[i][5], annotations[i][6], annotations[i][7]);
                }
                for(let i = 0; i < chat.length; i++){
                    writeOnHistory(chat[i]);
                }
                for(let i = 0; i < knowledge.length; i++){
                    await selectItem(knowledge[i]);
                }
            }
            if(!obj){
                await store.put(data);
            }

            await  tx.done;




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
 * @param name Either annotations or chat
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
            let obj = await search(name, image, room, store);
            if(obj){
                if(name === 'annotations') {
                    obj.annotations.push(data);
                }
                else if(name === 'knowledge'){
                    obj.knowledge.push(data);
                }
                else if(name === 'chat'){
                    obj.chat.push(data);
                }
                else if(data.length == 2){
                    if(data[1] === "next"){
                        obj.nextImage = data[0];
                    }
                    else{
                        obj.previousImage = data[0];
                    }
                }
                await store.put(obj);
            }
            await tx.done;

        } catch(error) {
            console.log(error);
            //localStorage.setItem(data.image + "-"+data.room, JSON.stringify(data));
        };
    }
    else localStorage.setItem(data.image + "-"+data.room, JSON.stringify(data));
}
window.storeOther= storeOther

/**
 * Add annotations/chat messages to IndexedDB
 * @param image The base64 representation of the image that has been annotated
 * @param room The room number
 */
async function clearAnnotations(image, room) {
    if (!db)
        await initDatabase();
    if (db) {
        try{
            let tx = await db.transaction(STORE_NAME, 'readwrite');
            let store = await tx.objectStore(STORE_NAME);

            let obj = await search("annotations", image, room, store);
            obj.annotations = [];
            await store.put(obj);

            await tx.done;

        } catch(error) {
            console.log(error);
            //localStorage.setItem(data.image + "-"+data.room, JSON.stringify());
        };
    }
    //else localStorage.setItem(data.image + "-"+data.room, JSON.stringify());
}
window.clearAnnotations = clearAnnotations;
/**
 * Gets knowledge graph information from IndexedDB
 * @param image The base64 representation of the image
 * @param room The room number
 */

async function nextPreviousIndexed(image, room) {
    if (!db)
        await initDatabase();
    if (db) {
        try{
            let tx = await db.transaction(STORE_NAME, 'readwrite');
            let store = await tx.objectStore(STORE_NAME);

            let obj = await search("room", image, room, store);
            let next = true;
            let prev = true;

            if(obj.nextImage){
                next = false;
            }
            if(obj.previousImage){
                prev = false;
            }
            await tx.done;
            return [next, prev];

        } catch(error) {
            console.log(error);
            //localStorage.setItem(data.image + "-"+data.room, JSON.stringify());
        };
    }
    //else localStorage.setItem(data.image + "-"+data.room, JSON.stringify());
}
window.nextPreviousIndexed = nextPreviousIndexed;

async function getKnowledge(image, room) {
    if (!db)
        await initDatabase();
    if (db) {
        try{
            let tx = await db.transaction(STORE_NAME, 'readwrite');
            let store = await tx.objectStore(STORE_NAME);
            let obj = await search("knowledge", image, room, store);
            await tx.done;

            return obj.knowledge;

        } catch(error) {
            console.log(error);
            //localStorage.setItem(data.image + "-"+data.room, JSON.stringify());
        };
    }
    //else localStorage.setItem(data.image + "-"+data.room, JSON.stringify());
}
window.getKnowledge= getKnowledge;

async function getNextPreviousImage(nextPrevImg, image, room) {
    if (!db)
        await initDatabase();
    if (db) {
        try{
            let tx = await db.transaction(STORE_NAME, 'readwrite');
            let store = await tx.objectStore(STORE_NAME);
            let obj = await search("image", image, room, store);
            console.log(obj);
            await tx.done;

            if(nextPrevImg){
                return obj.previousImage
            }
            return obj.nextImage;


        } catch(error) {
            console.log(error);
            //localStorage.setItem(data.image + "-"+data.room, JSON.stringify());
        };
    }
    //else localStorage.setItem(data.image + "-"+data.room, JSON.stringify());
}
window.getNextPreviousImage = getNextPreviousImage;

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