const {gql} = require('apollo-server-express');

export const typeDefs = gql`

    enum Collections {
        Users,
        Voclists
    }

    type Query{
        user(username: String!): User!
        translateWord(word: String!, fromLang: String!, toLang: String!): String
        translateWords(words: [String!], fromLang: String!, toLang: String!): [String]
        getImages(word: String!, lang: String!): [String!]
        getVoices: [Voice]
    }

    type Mutation{
        createUser(UserInput: UserInput!): Boolean
        #        addVoclist(userId: ID!, list: VoclistInput!): Boolean
        updateVoclist(list: VoclistInput!, changedBlobs: [String!]): Voclist!
    }

    type User @entity{
        _id: ID! @id
        username: String! @column
        voclists: [Voclist!] @link
    }

    input UserInput{
        username: String!
    }

    type Voclist @entity{
        _id: ID! @id
        settings: VoclistSettings @embedded
        words: [Word!] @embedded
        creator: String @column
        lastEdited: String @column
    }

    input VoclistInput{
        _id: ID!
        settings: VoclistSettingsInput!
        words: [WordInput!]
        creator: String
        lastEdited: String
    }

    type VoclistSettings @entity(embedded: true){
        title: String! @column
        description: String @column
        langSettings: LangSettings! @embedded
    }

    input VoclistSettingsInput{
        title: String!
        description: String
        langSettings: LangSettingsInput!
    }

    type LangSettings @entity(embedded: true){
        fromLang: String! @column
        toLang: String! @column
        toVoice: String! @column
    }

    input LangSettingsInput{
        fromLang: String!
        toLang: String!
        toVoice: String!
    }

    type Word @entity(embedded: true){
        from: String! @column
        to: String! @column
        img: String! @column
        toAudio: String! @column
        sentences: [Sentence!] @embedded
    }

    input WordInput{
        from: String!
        to: String!
        img: String!
        toAudio: String!
        sentences: [SentenceInput!]
    }

    type Sentence @entity(embedded: true){
        from: String! @column
        to: [String!] @column
    }

    input SentenceInput{
        from: String!
        to: [String!]
    }

    type Voice{
        DisplayName: String
        Gender: String
        ShortName: String
    }

`;