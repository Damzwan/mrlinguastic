import {ApolloServer, AuthenticationError} from 'apollo-server-express';
import express from "express";
import {resolv} from "./resolvers";
import {typeDefs} from "./schema";

import {DIRECTIVES} from '@graphql-codegen/typescript-mongodb';
import {azureAPI} from './datasources/azure';
import {PixabayAPI} from './datasources/pixabay';

require('dotenv').config()

const cors = require('cors')
const app = express()
app.use(cors())

const azure = new azureAPI()
app.get("/speech", async function (req, res) {
    await azure.textToSpeech(<string>req.query.word, <string>req.query.lang, <string>req.query.voice, res)
})

const dataSources = () => ({
    azureAPI: azure,
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
    },
});

server.applyMiddleware({app})

app.listen({port: 4000}, () => console.log(`Server ready at http://localhost:4000${server.graphqlPath}`))
