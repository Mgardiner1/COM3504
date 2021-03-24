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
 * it saves the forecasts for a city in localStorage
 * @param city
 * @param forecastObject
 */
async function addData(data) {
    console.log('Store Image: '+JSON.stringify(data));
    if (!db)
        await initDatabase();
    if (db) {
        try{
            let tx = await db.transaction(STORE_NAME, 'readwrite');
            let store = await tx.objectStore(STORE_NAME);
            await store.put(data);
            await  tx.done;
            console.log('added item to the store! '+ JSON.stringify(data));
        } catch(error) {
            console.log(error)
            //localStorage.setItem(JSON.stringify(data));
        };
    }
    //else localStorage.setItem(JSON.stringify(data));
}
window.addData= addData

async function storeOther(name, data, image, room) {
    if (!db)
        await initDatabase();
    if (db) {
        try{
            console.log("Start");
            let tx = await db.transaction(STORE_NAME, 'readwrite');
            let store = await tx.objectStore(STORE_NAME);
            let index = await store.index(name);
            let readingsList = await index.getAll();

            await tx.done;

            let obj;
            for (let elem of readingsList) {
                if (elem.image === image && elem.room === room.value){
                    console.log(elem.annotations);
                    obj = elem;
                }
            }
            if(obj){
                obj.annotations.push(data);
            }
            console.log(obj.annotations);
            addData(obj);

        } catch(error) {
            console.log(error);
            //localStorage.setItem(JSON.stringify(data));
        };
    }
   // else localStorage.setItem(JSON.stringify(data));
}
window.storeOther= storeOther


/**
 * it retrieves the forecasts data for a city from the database
 * @param city
 * @param date
 * @returns {*}
 */

async function search(name, readingsList) {
    let finalResults=[];
    if (readingsList && readingsList.length > 0) {
        let max;
        for (let elem of readingsList) {
            if (!max || elem.date > max.date)
                max = elem;
        }
        if (max) {
            finalResults.push(max);
        }
        return finalResults;
    }
    else {
        console.log("Bad");
    }

}
window.getValue= getValue;




