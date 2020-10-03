import {Collections, Resolvers, Voclist, VoclistDbObject} from "./gen-types";
import {MongoAPI} from "./datasources/mongodb";

require('dotenv').config()


const mongoAPI: MongoAPI = new MongoAPI();
mongoAPI.connect().then(() => console.log("db connected!"))

export const resolv: Resolvers = {
    Query: {
        user: async (_: any, args) =>
            await mongoAPI.getUser(args.oid),
        translateWord: async (_: any, args, {dataSources}: { dataSources: any }) => {
            let translatedWord;
            if (args.word.split(" ").length == 1) translatedWord = await dataSources.yandexAPI.dictionaryLookup(args.word, args.fromLang, args.toLang)
            console.log(translatedWord);
            return translatedWord ? translatedWord : await dataSources.azureAPI.translateWord(args.word, args.fromLang, args.toLang)
        },
        translateWords: async (_: any, args, {dataSources}: { dataSources: any }) => {
            const translateWordsProm = args.words.map(word => dataSources.azureAPI.translateWord(word, args.fromLang, args.toLang))
            return await Promise.all(translateWordsProm);
        },
        getImages: async (_: any, args, {dataSources}: { dataSources: any }) =>
            await dataSources.pixabayAPI.getImages(args.word, args.lang),
        getVoices: async (_: any, args, {dataSources}: { dataSources: any }) =>
            await dataSources.azureAPI.getVoices(),
        voclist: async (_: any, args, {dataSources}: { dataSources: any }) =>
            await mongoAPI.getEntityByCollectionAndId<Voclist>(Collections.Voclists, args.voclistId)
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
        deleteVoclist: async (_: any, args, {dataSources}: { dataSources: any }) => {
            args.blobs.forEach(blob => dataSources.azureAPI.deleteBlob(blob, "images"));
            await Promise.all([mongoAPI.deleteEntity(Collections.Voclists, args.vocId), mongoAPI.removeVoclist(args.userId, args.vocId)]);
            return true;
        },
        addSharedVoclist: async (_: any, args, {dataSources}: { dataSources: any }) => {
            await mongoAPI.addVoclist(args.userId, args.vocId);
            return true;
        },
    },
    User: {
        voclists: async (_user, _args) => {
            return await mongoAPI.getUserVoclists(_user.voclists, _user)
        }
    }
}