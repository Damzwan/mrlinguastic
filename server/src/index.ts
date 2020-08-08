import { ApolloServer, AuthenticationError } from 'apollo-server-express';
import * as express from "express";
import { resolv } from "./resolvers";
import { typeDefs } from "./schema";

import { DIRECTIVES } from '@graphql-codegen/typescript-mongodb';
import mongoose = require("mongoose")
import { MongoAPI } from './datasources/mongodb';
require('dotenv').config()

const app = express()

// const client = new MongoClient(process.env.MONGO_URI);
// client.connect()


const dataSources = () => ({
});

const server = new ApolloServer({
    typeDefs: [DIRECTIVES, typeDefs],
    resolvers: resolv,
    introspection: true,
    playground: true,
    engine: {
        reportSchema: true,
    }
});

server.applyMiddleware({ app })

app.listen({ port: 4000 }, () => console.log(`Server ready at http://localhost:4000${server.graphqlPath}`))
