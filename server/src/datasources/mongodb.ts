import {AggregationCursor, Db, MongoClient, ObjectId} from 'mongodb';
import {BasicVoclist, Collections, GroupDbObject, GroupInput, UserDbObject, VoclistDbObject, Word} from '../gen-types';

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
            user = {_id: oid, voclists: [], groups: []};
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

    async getBasicVoclist(id: string): Promise<BasicVoclist> {
        const cursor = this.db.collection<BasicVoclist>(Collections.Voclists).aggregate([{$match: {_id: id}}
            , {$project: {_id: 1, settings: 1, lastEdited: 1, creator: 1, wordsLength: {$size: "$words"}}}]);
        return await cursor.next();
    }

    async getWordsFromVoclist(vocId: string): Promise<Word[]> {
        const voclist = await this.db.collection(Collections.Voclists).findOne({_id: vocId}, {projection: {words: 1}})
        return voclist.words
    }

    async updateEntity<T>(collection: Collections, id: string, newEntity: T): Promise<void> {
        await this.db.collection(collection).replaceOne({_id: id}, newEntity, {upsert: true});
    }

    async deleteEntity(collection: Collections, id: string) {
        await this.db.collection(collection).deleteOne({_id: id})
    }

    async addVoclist(userId: string, vocId: string) {
        const user = await this.getUser(userId);
        if (!user.voclists.includes(vocId)) {
            user.voclists.push(vocId);
            await this.updateEntity(Collections.Users, userId, user);
        }
    }

    async removeVoclist(userId: string, vocId: string) {
        const user = await this.getUser(userId);
        user.voclists.splice(user.voclists.indexOf(vocId), 1);
        await this.updateEntity(Collections.Users, userId, user);
    }

    async getUserVoclists(vocIds: string[], user: UserDbObject): Promise<VoclistDbObject[]> {
        const vocLists = await this.getEntitiesByCollectionAndId<VoclistDbObject>(Collections.Voclists, vocIds);
        const filteredVoclists = vocLists.filter(item => item != null);

        if (vocIds.length != filteredVoclists.length) {
            user.voclists = filteredVoclists.map(voclist => voclist._id);
            this.updateEntity(Collections.Users, user._id, user).then(r => null);
        }
        return filteredVoclists
    }

    async getGroupVoclists(vocIds: string[], group: GroupDbObject): Promise<BasicVoclist[]> {
        const voclists = await Promise.all(vocIds.map(vocId => this.getBasicVoclist(vocId)))
        const filteredVoclists = voclists.filter(item => item != null);

        if (vocIds.length != filteredVoclists.length) {
            group.voclists = filteredVoclists.map(voclist => voclist._id);
            this.updateEntity(Collections.Groups, group._id, group).then(r => null);
        }
        return filteredVoclists
    }

    async createVoclistCopy(vocId: string) {
        const voclist = await this.getEntityByCollectionAndId<VoclistDbObject>(Collections.Voclists, vocId);
        voclist._id = new ObjectId().toHexString();
        this.updateEntity(Collections.Voclists, voclist._id, voclist).then();
        return voclist
    }

    async createGroup(groupInfo: GroupInput, userId: string) {
        const id: string = new ObjectId().toHexString();
        const newGroup: GroupDbObject = {
            _id: id,
            name: groupInfo.name,
            description: groupInfo.description,
            members: [userId],
            voclists: []
        }

        const user = await this.getUser(userId);
        user.groups.push(id);

        await Promise.all([this.updateEntity(Collections.Users, userId, user), this.updateEntity(Collections.Groups, id, newGroup)])
        return id;
    }

    async addVoclistToGroup(groupId: string, voclistId: string) {
        const group = await this.getEntityByCollectionAndId<GroupDbObject>(Collections.Groups, groupId);
        if (group.voclists.includes(voclistId)) return;
        group.voclists.push(voclistId)
        await this.updateEntity(Collections.Groups, groupId, group);
    }

    async removeVoclistFromGroup(groupId: string, voclistId: string) {
        const group = await this.getEntityByCollectionAndId<GroupDbObject>(Collections.Groups, groupId);
        group.voclists.splice(group.voclists.indexOf(voclistId), 1);
        await this.updateEntity(Collections.Groups, groupId, group);
    }

    async addUserToGroup(groupId: string, userId: string) {
        const objects = await Promise.all([this.getUser(userId), this.getEntityByCollectionAndId<GroupDbObject>(Collections.Groups, groupId)]);
        if (objects[0].groups.includes(groupId)) return;

        objects[0].groups.push(groupId);
        objects[1].members.push(userId);
        Promise.all([this.updateEntity(Collections.Users, userId, objects[0]), this.updateEntity(Collections.Groups, groupId, objects[1])]).then();
        return objects[1].name;
    }

    async removeUserFromGroup(groupId: string, userId: string) {
        const objects = await Promise.all([this.getUser(userId), this.getEntityByCollectionAndId<GroupDbObject>(Collections.Groups, groupId)]);
        objects[0].groups.splice(objects[0].groups.indexOf(groupId), 1);
        objects[1].members.splice(objects[1].members.indexOf(userId), 1);

        if (objects[1].members.length == 0) await Promise.all([this.updateEntity(Collections.Users, userId, objects[0]), this.deleteEntity(Collections.Groups, groupId)]);
        else await Promise.all([this.updateEntity(Collections.Users, userId, objects[0]), this.updateEntity(Collections.Groups, groupId, objects[1])])
    }
}