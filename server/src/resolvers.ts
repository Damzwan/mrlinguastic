import { Resolvers, Voclist, UserDbObject, Collections } from "./gen-types";
import { MongoAPI } from "./datasources/mongodb";
import { ObjectID } from "mongodb";
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
    },
    Mutation: {
        createUser: async (_: any, args) => {
            const user = { username: args.UserInput.username, voclists: [] }
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
        }

    },
    User: {
        voclists: async (_user, _args) => {
            return await mongoAPI.getEntitiesByCollectionAndId<Voclist>(Collections.Voclists, _user.voclists)
        }
    }
}