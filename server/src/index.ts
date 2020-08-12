import { ApolloServer, AuthenticationError } from 'apollo-server-express';
import express from "express";
import { resolv } from "./resolvers";
import { typeDefs } from "./schema";

import { DIRECTIVES } from '@graphql-codegen/typescript-mongodb';
import { TranslatorAPI } from './datasources/translator';
import { PixabayAPI } from './datasources/pixabay';
require('dotenv').config()

const app = express()

const dataSources = () => ({
    translatorAPI: new TranslatorAPI(),
    pixabayAPI: new PixabayAPI(),
});

const server = new ApolloServer({
    typeDefs: [DIRECTIVES, typeDefs],
    resolvers: resolv,
    dataSources,
    introspection: true,
    playground: true,
    engine: {
        reportSchema: true,
    }
});

server.applyMiddleware({ app })

app.listen({ port: 4000 }, () => console.log(`Server ready at http://localhost:4000${server.graphqlPath}`))
