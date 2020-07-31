const { gql } = require('apollo-server');

export const typeDefs = gql`

    type Query{
        user(username: String!): User
    }

    type User{
        username: String!,
        voclists: [Voclist!]
    }

    type Voclist{
        title: String
        description: String,
        fromLanguage: String,
        toLanguage: String,
        words: [Word!]
    }

    type Word{
        from: String!,
        to: String!,
    }

`;