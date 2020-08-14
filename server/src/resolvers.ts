import {Resolvers, Voclist, UserDbObject, Collections} from "./gen-types";
import {MongoAPI} from "./datasources/mongodb";
import {ObjectID} from "mongodb";

require('dotenv').config()

var mongoAPI: MongoAPI;

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
        getImages: async (_: any, args, {dataSources}: { dataSources: any }) =>
            await dataSources.pixabayAPI.getImages(args.word, args.lang),
        getAudio: async (_: any, args, {dataSources}: { dataSources: any }) =>
            await dataSources.azureAPI.textToSpeech(),
        getVoices: async (_: any, args, {dataSources}: { dataSources: any }) =>
            await dataSources.azureAPI.getVoices()
    },
    Mutation: {
        createUser: async (_: any, args) => {
            const user = {username: args.UserInput.username, voclists: [typeof String]}
            await mongoAPI.addEntity(Collections.Voclists, user);
            return true;
        },
        addVoclist: async (_: any, args) => {
            const user = await mongoAPI.getEntityByCollectionAndId<UserDbObject>(Collections.Users, new ObjectID(args.userId));
            await mongoAPI.addVocList(user, args.list)
            return true;
        },
        updateVoclist: async (_: any, args) => {
            mongoAPI.updateEntity(Collections.Voclists, new ObjectID(args.vocId), args.newList)
            return true;
        },
    },
    User: {
        voclists: async (_user, _args) => {
            return await mongoAPI.getEntitiesByCollectionAndId<Voclist>(Collections.Voclists, _user.voclists)
        }
    }
}