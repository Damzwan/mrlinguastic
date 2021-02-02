import {ApolloServer} from 'apollo-server-express';
import express from "express";
import {resolv} from "./src/resolvers";
import {typeDefs} from "./src/schema";

import {azureAPI} from './src/datasources/azure';
import {PixabayAPI} from './src/datasources/pixabay';
import {YandexAPI} from "./src/datasources/yandex";
import {reversoAPI} from "./src/datasources/reverso";
import * as fs from "fs";
import * as path from "path";

require('dotenv').config()

const cors = require('cors')
const compression = require('compression')
const app = express()
app.use(cors())
app.use(compression());
app.use(express.static(__dirname + "/public/", {
    etag: true, // Just being explicit about the default.
    lastModified: true,  // Just being explicit about the default.
    setHeaders: (res, path) => {
        const hashRegExp = new RegExp('\\.[0-9a-f]{8}\\.');
        if (path.endsWith('.html')) {
            // All of the project's HTML files end in .html
            res.setHeader('Cache-Control', 'no-cache');
        } else if (hashRegExp.test(path)) {
            // If the RegExp matched, then we have a versioned URL.
            res.setHeader('Cache-Control', 'max-age=31536000');
        }
    },
}));

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
    yandexAPI: new YandexAPI(),
    reversoAPI: new reversoAPI()
});

const server = new ApolloServer({
    typeDefs: [typeDefs],
    resolvers: resolv,
    dataSources,
    introspection: true,
    playground: true,
});

server.applyMiddleware({app})

const PORT = process.env.PORT || 4000;
app.listen({port: PORT}, () => console.log(`Our app is running on port ${PORT}`))