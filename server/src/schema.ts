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
        addVoclist(userId: ID!, list: VoclistInput!): Boolean
        updateVoclist(vocId: ID!, newList: VoclistInput!): Boolean
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
        title: String!
        description: String
        from: String!
        to: String!
        words: [WordInput!]
    }
    
    type VoclistSettings @entity(embedded: true){
        title: String! @column
        description: String @column
        langSettings: LangSettings @embedded
    }
    
    type LangSettings @entity(embedded: true){
        fromLang: String! @column
        fromVoice: String! @column
        toLang: String! @column
        toVoice: String! @column
    }
    
    type Word @entity(embedded: true){
        from: String! @column
        to: String! @column
        imgUrl: String! @column
        fromAudio: String! @column
        toAudio: String! @column
        sentences: [Sentence!] @embedded
    }

    type Sentence @entity(embedded: true){
        from: String! @column
        to: [String!] @column
    }

    input WordInput{
        from: String!
        to: String!
    }

    type Voice{
        DisplayName: String
        Gender: String
        ShortName: String
    }

`;