import {GetUserQuery, Maybe, Scalars, Sentence, User, Voclist, VoclistSettings, Word} from "@/gen-types";
import {ObjectID} from 'bson';
import {getBlobUrl} from "@/use/general";
import {BasicGroupInfo} from "@/use/state";

// import {getBlobUrl} from "@/use/blobStorage";

export interface UserDbObject {
    _id: string;
    voclists: string[],
    groups: BasicGroupInfo[]
}

export class Localdb {
    db: IDBDatabase | null;

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

            const objectStore2 = db.createObjectStore('user', {keyPath: '_id'});
            objectStore2.createIndex('_id', '_id', {unique: true});

            const objectStore3 = db.createObjectStore('downloadedVoclists', {keyPath: '_id'});
            objectStore3.createIndex('_id', '_id', {unique: true});
        };

        // onsuccess handler signifies that the database opened successfully
        return await new Promise(resolve => {
            request.onsuccess = function () {
                console.log('Database opened successfully');
                resolve(request.result);
            };
        });
    }

    async getItem<T>(_id: string, storeName: string): Promise<T | null> {
        if (!this.db) return null;
        const transaction = this.db.transaction([storeName]);
        const store = transaction.objectStore(storeName);
        const request = store.get(_id);

        return await new Promise(resolve => {
            request.onsuccess = function () {
                resolve(request.result);
            };
        });
    }

    async getItems<T>(storeName: string): Promise<T[] | null> {
        if (!this.db) return null;
        const transaction = this.db.transaction([storeName]);
        const store = transaction.objectStore(storeName);
        const req = store.getAllKeys();

        const lists: T[] = [];
        const _ids: IDBValidKey[] = await new Promise(resolve => {
            req.onsuccess = function () {
                resolve(req.result)
            }
        })

        for (const _id of _ids) {
            const item = await this.getItem<T>(_id.toString(), storeName);
            if (item) lists.push(item);
        }

        return lists;
    }


    async restoreVocList(_id: string): Promise<Voclist | null> {
        return await this.getItem<Voclist>(_id, "voclists");
    }

    async createVoclist(settings: VoclistSettings, words: Word[], creator: string): Promise<string> {
        const list: Voclist = {
            _id: new ObjectID().toString(),
            settings: settings,
            words: words,
            lastEdited: new Date().toISOString(),
            creator: creator,
        }

        await this.save("voclists", list);
        return list._id;
    }

    async save(storeName: string, item: any): Promise<void> {
        if (!this.db) return;
        const transaction = this.db.transaction([storeName], 'readwrite');
        const objectStore = transaction.objectStore(storeName);
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


    async deleteItem(_id: string, storeName: string): Promise<void> {
        if (!this.db) return;
        const transaction = this.db.transaction([storeName], 'readwrite');
        const objectStore = transaction.objectStore(storeName);
        const request = objectStore.delete(_id);

        const prom = new Promise(resolve => {
            transaction.oncomplete = function () {
                resolve();
            }
        })
        await prom;
    }

    async clearStore(storeName: string): Promise<void> {
        if (!this.db) return;
        const transaction = this.db.transaction([storeName], "readwrite");
        const store = transaction.objectStore(storeName);
        const req = store.clear();
    }

    async getBase64Url(url: string): Promise<string> {
        const reader = new FileReader();
        const res = await fetch(url);
        const blob = await res.blob();
        return new Promise(resolve1 => {
            reader.readAsDataURL(blob);
            reader.onload = () => {
                resolve1(reader.result as string)
            }
        })
    }

    async downloadVoclist(list: Voclist): Promise<Voclist> {
        list.words = await Promise.all(list.words!.map(async word => {
            if (word.img) word.img = await this.getBase64Url(getBlobUrl(word.img));
            return word;
        }))
        this.save("downloadedVoclists", list).then();
        return list;
    }

    async createUser(): Promise<UserDbObject> {
        const user: UserDbObject = {
            _id: "0",
            voclists: [],
            groups: []
        }

        await this.save("user", user)
        return user;
    }

    async addListToUser(vocId: string): Promise<void> {
        const user = await this.getItem<UserDbObject>("0", "user");

        if (!user.voclists.includes(vocId)) {
            user.voclists.push(vocId);
            await this.save("user", user);
        }
    }

    async removeListFromUser(vocId: string): Promise<void> {
        const user = await this.getItem<UserDbObject>("0", "user");
        if (user.voclists.splice(user.voclists.indexOf(vocId), 1)) await this.save("user", user);
    }

    private static containsGroup(groupId: string, groups: BasicGroupInfo[]): number {
        for (let i = 0; i < groups.length; i++)
            if (groups[i]._id == groupId) return i;
        return -1;
    }

    async addGroupToUser(group: BasicGroupInfo): Promise<void> {
        const user = await this.getItem<UserDbObject>("0", "user");

        if (Localdb.containsGroup(group._id, user.groups) == -1) {
            user.groups.push(group);
            await this.save("user", user);
        }
    }

    async removeGroupFromUser(groupId: string): Promise<void> {
        const user = await this.getItem<UserDbObject>("0", "user");
        const i = Localdb.containsGroup(groupId, user.groups);

        if (i > -1) {
            user.groups.splice(i, 1);
            await this.save("user", user);
        }
    }

    async resetUser(voclistIds: string[], groups: BasicGroupInfo[]) {
        const user: UserDbObject = {
            _id: "0",
            voclists: voclistIds,
            groups: groups
        };

        await this.save("user", user);
    }
}