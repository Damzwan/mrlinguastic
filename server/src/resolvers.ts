import {Collections, Resolvers, VoclistDbObject} from "./gen-types";
import {MongoAPI} from "./datasources/mongodb";

require('dotenv').config()

let mongoAPI: MongoAPI;

//kind of a hack :))
setup();

async function setup() {
    mongoAPI = new MongoAPI();
    await mongoAPI.connect();
}

export const resolv: Resolvers = {
    Query: {
        user: async (_: any, args) =>
            await mongoAPI.getUser(args.oid),
        translateWord: async (_: any, args, {dataSources}: { dataSources: any }) =>
            await dataSources.azureAPI.translateWord(args.word, args.fromLang, args.toLang),
        translateWords: async (_: any, args, {dataSources}: { dataSources: any }) => {
            const translateWordsProm = args.words.map(word => dataSources.azureAPI.translateWord(word, args.fromLang, args.toLang))
            return await Promise.all(translateWordsProm);
        },
        getImages: async (_: any, args, {dataSources}: { dataSources: any }) =>
            await dataSources.pixabayAPI.getImages(args.word, args.lang),
        getVoices: async (_: any, args, {dataSources}: { dataSources: any }) =>
            await dataSources.azureAPI.getVoices(),
        voclists: async (_: any, args, {dataSources}: { dataSources: any }) =>
            await mongoAPI.getAllEntitiesByCollection<VoclistDbObject>(Collections.Voclists)
    },
    Mutation: {
        updateVoclist: async (_: any, args, {dataSources}: { dataSources: any }) => {
            const newImgs = await Promise.all(args.list.words.map(word => word.img ? dataSources.azureAPI.saveBlob(word.img, "images") : null));
            for (let i = 0; i < newImgs.length; i++) args.list.words[i].img = newImgs[i];
            args.changedBlobs.forEach(blob => dataSources.azureAPI.deleteBlob(blob, "images"));
            args.list.lastEdited = new Date().toISOString();

            const listToSave: VoclistDbObject = {
                _id: args.list._id,
                words: args.list.words,
                settings: args.list.settings,
                creator: args.list.creator,
                lastEdited: args.list.lastEdited
            }

            mongoAPI.updateEntity(Collections.Voclists, listToSave._id, listToSave);

            const user = await mongoAPI.getUser(args.oid);
            if (!user.voclists.includes(listToSave._id)) {
                user.voclists.push(listToSave._id);
                mongoAPI.updateEntity(Collections.Users, user._id, user);
            }
            return true;
        },
        saveImg: async (_: any, args, {dataSources}: { dataSources: any }) => {
            return await dataSources.azureAPI.saveBlob(args.img, "images");
        },
        deleteVoclist: async (_: any, args, {dataSources}: { dataSources: any }) => {
            mongoAPI.deleteEntity(Collections.Voclists, args.vocId);
            const user = await mongoAPI.getUser(args.userId);
            user.voclists.splice(user.voclists.indexOf(args.vocId), 1);
            mongoAPI.updateEntity(Collections.Users, user._id, user);
            return true;
        },
    },
    User: {
        voclists: async (_user, _args) => {
            return await mongoAPI.getEntitiesByCollectionAndId<VoclistDbObject>(Collections.Voclists, _user.voclists)
        }
    }
}