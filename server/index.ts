import {ApolloServer, AuthenticationError} from 'apollo-server-express';
import express from "express";
import {resolv} from "./src/resolvers";
import {typeDefs} from "./src/schema";

import {DIRECTIVES} from '@graphql-codegen/typescript-mongodb';
import {azureAPI} from './src/datasources/azure';
import {PixabayAPI} from './src/datasources/pixabay';

require('dotenv').config()

const cors = require('cors')
const app = express()
app.use(cors())
app.use(express.static(__dirname + "/public/"));

const azure = new azureAPI()

app.get('/', function (req, res) {
    res.sendFile(__dirname + '/public/index.html');
});

app.get("/speech", async function (req, res) {
    await azure.textToSpeech(<string>req.query.word, <string>req.query.lang, <string>req.query.voice, res)
})

const dataSources = () => ({
    azureAPI: azure,
    pixabayAPI: new PixabayAPI(),
});

const server = new ApolloServer({
    typeDefs: [typeDefs],
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