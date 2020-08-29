import { DataSource } from 'apollo-datasource';
import {MongoClient, Db, ObjectID, InsertOneWriteOpResult, Cursor} from 'mongodb';
import { UserDbObject, Collections } from '../gen-types';
import { response } from 'express';
require('dotenv').config()

export class MongoAPI {
    db: Db;

    constructor() { }

    async connect() { // add async
        try {
            if (!this.db) { // I added this extra check
                const dbConnection = await MongoClient.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
                this.db = dbConnection.db("mrlinguastic");
                console.log('Connected to db');
            }
        } catch (error) {
            console.log('error during connecting to mongo: ');
            console.error(error);
        }
    }

    async getUser(username: string): Promise<UserDbObject> {
        return await this.db.collection<UserDbObject>(Collections.Users).findOne({ username: username })
    }

    async getAllEntitiesByCollection<T>(collection: Collections): Promise<T[]>{
        return this.db.collection<T>(collection).find({}).toArray();
    }

    async getEntityByCollectionAndId<T>(collection: Collections, id: ObjectID): Promise<T> {
        return await this.db.collection(collection).findOne({ _id: id })
    }

    async getEntitiesByCollectionAndId<T>(collection: Collections, ids: ObjectID[]): Promise<T[]> {
        const proms = ids.map(id => this.getEntityByCollectionAndId<T>(collection, id))
        return await Promise.all(proms)
    }

    async updateEntity<T>(collection: Collections, id: ObjectID, newEntity: T): Promise<void> {
        await this.db.collection(collection).replaceOne({ _id: id }, newEntity, {upsert: true});
    }

    async addEntity<T>(collection: Collections, entity: T) {
        return await this.db.collection(collection).insertOne(entity);
    }

}