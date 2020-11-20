import {Collections, GroupDbObject, Resolvers, Voclist, VoclistDbObject, Word} from "./gen-types";
import {MongoAPI} from "./datasources/mongodb";
import {ObjectId} from "mongodb";

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
            return await Promise.all(args.words.map(word => dataSources.azureAPI.translateWord(word, args.fromLang, args.toLang)));
        },
        getImages: async (_: any, args, {dataSources}: { dataSources: any }) =>
            await dataSources.pixabayAPI.getImages(args.word, args.lang),
        getVoices: async (_: any, args, {dataSources}: { dataSources: any }) =>
            await dataSources.azureAPI.getVoices(),
        voclist: async (_: any, args, {dataSources}: { dataSources: any }) =>
            args.voclistId != "" ? await mongoAPI.getEntityByCollectionAndId<Voclist>(Collections.Voclists, args.voclistId) : null,
        words: async (_: any, args, {dataSources}: { dataSources: any }) =>
            args.voclistId != "" ? await mongoAPI.getWordsFromVoclist(args.voclistId) : null,
        group: async (_: any, args, {dataSources}: { dataSources: any }) =>
            args.groupId != "" ? await mongoAPI.getEntityByCollectionAndId<GroupDbObject>(Collections.Groups, args.groupId) : null,
        getExamples: async (_: any, args, {dataSources}: { dataSources: any }) =>
            await dataSources.reversoAPI.getExamples(args.from, args.to, args.fromLang, args.toLang)

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
        copyImgs: async (_: any, args, {dataSources}: { dataSources: any }) => {
            return args.imgs.map(img => dataSources.azureAPI.copyBlob(img))
        },
        deleteVoclist: async (_: any, args, {dataSources}: { dataSources: any }) => {
            const words = await mongoAPI.getWordsFromVoclist(args.vocId);
            words.forEach(word => word.img ? dataSources.azureAPI.deleteBlob(word.img, "images") : null)
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
            const voclist = await mongoAPI.getEntityByCollectionAndId<VoclistDbObject>(Collections.Voclists, args.voclistId);
            voclist._id = new ObjectId().toHexString();
            voclist.words.forEach(word => word.img = dataSources.azureAPI.copyBlob(word.img));
            mongoAPI.updateEntity(Collections.Voclists, voclist._id, voclist).then();
            mongoAPI.addVoclist(args.userId, voclist._id).then();
            return voclist;
        }
    },
    User: {
        voclists: async (_user, _args) => {
            return await Promise.all(_user.voclists.map(voclist => mongoAPI.getBasicVoclist(voclist)));
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