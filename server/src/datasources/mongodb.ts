import {Db, MongoClient} from 'mongodb';
import {Collections, UserDbObject, VoclistDbObject} from '../gen-types';

require('dotenv').config()

export class MongoAPI {
    db: Db;

    constructor() {
    }

    async connect() { // add async
        try {
            if (!this.db) { // I added this extra check
                const dbConnection = await MongoClient.connect(process.env.MONGO_URI, {
                    useNewUrlParser: true,
                    useUnifiedTopology: true
                })
                this.db = dbConnection.db("mrlinguastic");
            }
        } catch (error) {
            console.log('error during connecting to mongo: ');
            console.error(error);
        }
    }

    async getUser(oid: string): Promise<UserDbObject> {
        let user: UserDbObject = await this.db.collection<UserDbObject>(Collections.Users).findOne({_id: oid})

        if (!user) {
            user = {_id: oid, voclists: []};
            await this.db.collection<UserDbObject>(Collections.Users).insertOne(user);
        }
        return user;
    }

    async getEntityByCollectionAndId<T>(collection: Collections, id: string): Promise<T> {
        return await this.db.collection(collection).findOne({_id: id})
    }

    async getEntitiesByCollectionAndId<T>(collection: Collections, ids: string[]): Promise<T[]> {
        const proms = ids.map(id => this.getEntityByCollectionAndId<T>(collection, id))
        return await Promise.all(proms)
    }

    async updateEntity<T>(collection: Collections, id: string, newEntity: T): Promise<void> {
        await this.db.collection(collection).replaceOne({_id: id}, newEntity, {upsert: true});
    }

    async deleteEntity(collection: Collections, id: string){
        await this.db.collection(collection).deleteOne({_id: id})
    }

    async addVoclist(userId: string, vocId: string){
        const user = await this.getUser(userId);
        if (!user.voclists.includes(vocId)) {
            user.voclists.push(vocId);
            await this.updateEntity(Collections.Users, userId, user);
        }
    }

    async removeVoclist(userId: string, vocId: string){
        const user = await this.getUser(userId);
        user.voclists.splice(user.voclists.indexOf(vocId), 1);
        await this.updateEntity(Collections.Users, userId, user);
    }

    async getUserVoclists(vocIds: string[], user: UserDbObject): Promise<VoclistDbObject[]>{
        const vocLists = await this.getEntitiesByCollectionAndId<VoclistDbObject>(Collections.Voclists, vocIds);
        const filteredVoclists = vocLists.filter(item => item != null);

        if (vocIds.length != filteredVoclists.length) {
            user.voclists = filteredVoclists.map(voclist => voclist._id);
            this.updateEntity(Collections.Users, user._id, user).then(r => null);
        }
        return filteredVoclists
    }
}