import {Sentence, Voclist, VoclistSettings, Word} from "@/gen-types";
import {inject, provide} from "@vue/composition-api";
import {ObjectID} from 'bson';

export interface WordLocalDb {
    from: string;
    to: string;
    imgUrl: Blob;
    fromAudio: Blob;
    toAudio: Blob;
    sentences: Sentence[];
}

export interface VoclistLocalDb {
    _id: string;
    settings: VoclistSettings;
    words: WordLocalDb[];
    lastEdited: string;
    creator: string;
}

export class Localdb {
    db: IDBDatabase;

    constructor() {
        this.db = null;
    }

    async connect() {
        this.db = await this.open();
    }

    async open(): Promise<IDBDatabase> {
        const request = window.indexedDB.open('db', 1);
        request.onerror = function () {
            console.log('Database failed to open');
        };

        request.onupgradeneeded = function () {
            const db = request.result;
            const objectStore = db.createObjectStore('voclists', {keyPath: '_id'});

            objectStore.createIndex('_id', '_id', {unique: true});
            objectStore.createIndex('title', 'title', {unique: false});
            objectStore.createIndex('description', 'description', {unique: false});
            objectStore.createIndex('langSettings', 'langSettings', {unique: false});
            objectStore.createIndex('words', 'words', {unique: false});
            objectStore.createIndex('lastEdited', 'lastEdited', {unique: false});
            objectStore.createIndex('creator', 'creator', {unique: false});
        };

        // onsuccess handler signifies that the database opened successfully
        return await new Promise(resolve => {
            request.onsuccess = function () {
                console.log('Database opened successfully');
                resolve(request.result);
            };
        });
    }

    async getVoclist(_id: string): Promise<VoclistLocalDb> {
        const transaction = this.db.transaction(['voclists']);
        const store = transaction.objectStore('voclists');
        const request = store.get(_id);

        return await new Promise(resolve => {
            request.onsuccess = function () {
                resolve(request.result);
            };
        });
    }

    async restoreVocList(_id: string): Promise<Voclist> {
        const list = await this.getVoclist(_id);
        const newWords: Word[] = [];

        for (const word of list.words) {
            newWords.push({
                from: word.from,
                to: word.to,
                imgUrl: word.imgUrl ? URL.createObjectURL(word.imgUrl) : null,
                fromAudio: word.fromAudio ? URL.createObjectURL(word.fromAudio) : null,
                toAudio: word.toAudio ? URL.createObjectURL(word.toAudio) : null,
                sentences: word.sentences
            })
        }

        return {
            _id: list._id,
            settings: list.settings,
            words: newWords,
            lastEdited: list.lastEdited,
            creator: list.creator,
        }
    }

    async createVoclist(settings: VoclistSettings, words: Word[], creator: string): Promise<string> {
        const list: VoclistLocalDb = {
            _id: new ObjectID().toString(),
            settings: settings,
            words: await this.transformWords(words),
            lastEdited: new Date().toISOString(),
            creator: creator,
        }

        await this.save("voclists", list);
        return list._id;
    }

    async updateVoclist(list: Voclist) {

        const listToUpdate: VoclistLocalDb = {
            _id: list._id,
            settings: list.settings,
            words: await this.transformWords(list.words),
            lastEdited: new Date().toISOString(),
            creator: list.creator,
        }

        await this.save("voclists", listToUpdate);
    }

    async save(storeName: string, item: any) {
        const transaction = this.db.transaction([storeName], 'readwrite');
        const objectStore = transaction.objectStore('voclists');
        const request = objectStore.put(item);

        await new Promise(resolve => {
            transaction.oncomplete = function () {
                resolve()
            };
            transaction.onerror = function () {
                console.log('Save failed');
                resolve()
            };
        })
    }


    async transformWords(words: Word[]): Promise<WordLocalDb[]> {
        const newWords: WordLocalDb[] = [];

        for (const word of words) {
            newWords.push({
                from: word.from,
                to: word.to,
                imgUrl: await fetch(word.imgUrl).then(r => r.blob()),
                fromAudio: await fetch(word.fromAudio).then(r => r.blob()),
                toAudio: await fetch(word.toAudio).then(r => r.blob()),
                sentences: word.sentences
            })
        }
        return newWords;
    }

    async deleteVoclist(_id: string) {
        const transaction = this.db.transaction(['voclists'], 'readwrite');
        const objectStore = transaction.objectStore('voclists');
        const request = objectStore.delete(_id);

        const prom = new Promise(resolve => {
            transaction.oncomplete = function () {
                resolve();
            }
        })
        await prom;
    }

    async getAllVoclists() {
        const transaction = this.db.transaction(['voclists']);
        const store = transaction.objectStore('voclists');
        const req = store.getAllKeys();

        const lists: VoclistLocalDb[] = [];
        const _ids: IDBValidKey[] = await new Promise(resolve => {
            req.onsuccess = function(){resolve(req.result)}
        })

        for (const _id of _ids) lists.push(await this.getVoclist(_id.toString()))
        return lists;
    }
}

const db = new Localdb();
const dbSymbol = Symbol();

/**
 * provide the database to our app
 */
export async function provideDb() {
    provide(dbSymbol, db);
}

/**
 * retrieve the database
 */
export function getDb() {
    return inject<Localdb>(dbSymbol);
}