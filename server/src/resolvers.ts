import { Resolvers } from "./gen-types";

export const resolv: Resolvers = {
    Query: {
        user: async (_: any, args, { dataSources }: { dataSources: any }) => {
            return { username: args.username, voclists: [] }
        }
    }
}