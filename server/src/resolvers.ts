import {Collections, Group, GroupDbObject, Resolvers, Voclist, VoclistDbObject} from "./gen-types";
import {MongoAPI} from "./datasources/mongodb";

require('dotenv').config()


const mongoAPI: MongoAPI = new MongoAPI();
mongoAPI.connect().then(() => console.log("db connected!"))

export const resolv: Resolvers = {
    Query: {
        user: async (_: any, args) =>
            args.oid != "" ? await mongoAPI.getUser(args.oid) : null,
        translateWord: async (_: any, args, {dataSources}: { dataSources: any }) => {
            if (args.word == "" || args.fromLang == "" || args.toLang == "") return [""];
            let translatedWord;
            if (args.word.split(" ").length == 1) translatedWord = await dataSources.yandexAPI.dictionaryLookup(args.word, args.fromLang, args.toLang)
            return translatedWord ? translatedWord : [await dataSources.azureAPI.translateWord(args.word, args.fromLang, args.toLang)]
        },
        translateWords: async (_: any, args, {dataSources}: { dataSources: any }) => {
            if (args.words.length == 0 || args.fromLang == "" || args.toLang == "") return [""];
            const translateWordsProm = args.words.map(word => dataSources.azureAPI.translateWord(word, args.fromLang, args.toLang)[0])
            return await Promise.all(translateWordsProm);
        },
        getImages: async (_: any, args, {dataSources}: { dataSources: any }) =>
            await dataSources.pixabayAPI.getImages(args.word, args.lang),
        getVoices: async (_: any, args, {dataSources}: { dataSources: any }) =>
            await dataSources.azureAPI.getVoices(),
        voclist: async (_: any, args, {dataSources}: { dataSources: any }) =>
            args.voclistId != "" ? await mongoAPI.getEntityByCollectionAndId<Voclist>(Collections.Voclists, args.voclistId) : null,
        group: async (_: any, args, {dataSources}: { dataSources: any }) =>
            args.groupId != "" ? await mongoAPI.getEntityByCollectionAndId<GroupDbObject>(Collections.Groups, args.groupId) : null
    },
    Mutation: {
        updateVoclist: async (_: any, args, {dataSources}: { dataSources: any }) => {
            args.changedBlobs.forEach(blob => dataSources.azureAPI.deleteBlob(blob, "images"));
            await Promise.all([mongoAPI.updateEntity(Collections.Voclists, args.list._id, args.list), mongoAPI.addVoclist(args.oid, args.list._id)]);
            return true;
        },
        saveImg: async (_: any, args, {dataSources}: { dataSources: any }) => {
            return await dataSources.azureAPI.saveBlob(args.img, "images");
        },
        removeImgs: async (_: any, args, {dataSources}: { dataSources: any }) => {
            args.imgs.forEach(img => dataSources.azureAPI.deleteBlob(img, "images"));
            return true;
        },
        deleteVoclist: async (_: any, args, {dataSources}: { dataSources: any }) => {
            args.blobs.forEach(blob => dataSources.azureAPI.deleteBlob(blob, "images"));
            await Promise.all([mongoAPI.deleteEntity(Collections.Voclists, args.vocId), mongoAPI.removeVoclist(args.userId, args.vocId)]);
            return true;
        },
        addSharedVoclist: async (_: any, args, {dataSources}: { dataSources: any }) => {
            await mongoAPI.addVoclist(args.userId, args.vocId);
            return true;
        },
        createGroup: async (_: any, args, {dataSources}: { dataSources: any }) => {
            return await mongoAPI.createGroup(args.groupInfo, args.userId);
        },
        addVoclistToGroup: async (_: any, args, {dataSources}: { dataSources: any }) => {
            await mongoAPI.addVoclistToGroup(args.groupId, args.vocId);
            return true;
        },
        removeVoclistFromGroup: async (_: any, args, {dataSources}: { dataSources: any }) => {
            await mongoAPI.removeVoclistFromGroup(args.groupId, args.vocId);
            return true;
        },
        addUserToGroup: async (_: any, args, {dataSources}: { dataSources: any }) => {
            return await mongoAPI.addUserToGroup(args.groupId, args.userId);
        },
        removeUserFromGroup: async (_: any, args, {dataSources}: { dataSources: any }) => {
            await mongoAPI.removeUserFromGroup(args.groupId, args.userId);
            return true;
        },
        copyVoclist: async (_: any, args, {dataSources}: { dataSources: any }) => {
            return await mongoAPI.createVoclistCopy(args.voclistId)
        }
    },
    User: {
        voclists: async (_user, _args) => {
            return await mongoAPI.getUserVoclists(_user.voclists, _user)
        },
        groups: async (group, _args) => {
            return await mongoAPI.getEntitiesByCollectionAndId<GroupDbObject>(Collections.Groups, group.groups)
        },
    },
    Group: {
        voclists: async (group, _args) => {
            return await mongoAPI.getGroupVoclists(group.voclists, group);
        },
    }
}