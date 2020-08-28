import {Resolvers, Voclist, UserDbObject, Collections} from "./gen-types";
import {MongoAPI} from "./datasources/mongodb";
import {ObjectID} from "mongodb";

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
            await mongoAPI.getUser(args.username),
        translateWord: async (_: any, args, {dataSources}: { dataSources: any }) =>
            await dataSources.azureAPI.translateWord(args.word, args.fromLang, args.toLang),
        translateWords: async (_: any, args, {dataSources}: { dataSources: any }) => {
            const translateWordsProm = args.words.map(word => dataSources.azureAPI.translateWord(word, args.fromLang, args.toLang))
            return await Promise.all(translateWordsProm);
        },
        getImages: async (_: any, args, {dataSources}: { dataSources: any }) =>
            await dataSources.pixabayAPI.getImages(args.word, args.lang),
        getVoices: async (_: any, args, {dataSources}: { dataSources: any }) =>
            await dataSources.azureAPI.getVoices()
    },
    Mutation: {
        createUser: async (_: any, args) => {
            const user = {username: args.UserInput.username, voclists: [typeof String]}
            await mongoAPI.addEntity(Collections.Voclists, user);
            return true;
        },
        updateVoclist: async (_: any, args, {dataSources}: { dataSources: any }) => {
            const newImgs = await Promise.all(args.list.words.map(word => dataSources.azureAPI.saveBlob(word.img, "images")));
            for (let i = 0; i < newImgs.length; i++) args.list.words[i].img = newImgs[i];
            args.changedBlobs.forEach(blob => dataSources.azureAPI.deleteBlob(blob, "images"));
            //TODO update database and lastEdited as well
            return args.list
        }
    },
    User: {
        voclists: async (_user, _args) => {
            return await mongoAPI.getEntitiesByCollectionAndId<Voclist>(Collections.Voclists, _user.voclists)
        }
    }
}