import { ApolloServer } from "apollo-server";
import { resolv } from "./resolvers";
import { typeDefs } from "./schema";
require('dotenv').config()

const dataSources = () => ({

});

const server = new ApolloServer({
    typeDefs: typeDefs,
    resolvers: resolv,
    introspection: true,
    playground: true,
    engine: {
        reportSchema: true
    }
});

server.listen().then(({ url }) => {
    console.log(`🚀 Server ready at ${url}`);
});