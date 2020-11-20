import {ApolloServer, AuthenticationError} from 'apollo-server-express';
import express from "express";

const spdy = require('spdy');
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
app.use(express.static(__dirname + "/public/"));

const azure = new azureAPI()

const options = {
    key: fs.readFileSync(path.join(__dirname, '/privateKey.key')),
    cert: fs.readFileSync(path.join(__dirname, '/certificate.crt'))
}

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
app.listen({port: 4000}, () => console.log(`Server ready at http://localhost:4000${server.graphqlPath}`))

// spdy
//     .createServer(options, app)
//     .listen(4000, (error) => {
//         if (error) {
//             console.error(error)
//             return process.exit(1)
//         } else {
//             console.log('Listening on port: ' + 4000 + '.')
//         }
//     })