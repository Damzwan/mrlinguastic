const {gql} = require('apollo-server-express');

export const typeDefs = gql`

    directive @union(
        discriminatorField: String
        additionalFields: [AdditionalEntityFields]
    ) on UNION
    directive @abstractEntity(
        discriminatorField: String!
        additionalFields: [AdditionalEntityFields]
    ) on INTERFACE
    directive @entity(
        embedded: Boolean
        additionalFields: [AdditionalEntityFields]
    ) on OBJECT
    directive @column(overrideType: String) on FIELD_DEFINITION
    directive @id on FIELD_DEFINITION
    directive @link(overrideType: String) on FIELD_DEFINITION
    directive @embedded on FIELD_DEFINITION
    directive @map(path: String!) on FIELD_DEFINITION
    directive @cacheControl(
        maxAge: Int
        scope: CacheControlScope
    ) on FIELD_DEFINITION | OBJECT | INTERFACE
    input AdditionalEntityFields {
        path: String
        type: String
    }

    enum CacheControlScope {
        PUBLIC
        PRIVATE
    }

    enum Collections {
        Users,
        Voclists,
        Groups
    }

    type Query{
        user(oid: String!): User
        lastUpdated(oid: String!): String!
        translateWord(word: String!, fromLang: String!, toLang: String!): [String]
        translateWords(words: [String!], fromLang: String!, toLang: String!): [String]
        voclist(voclistId: String!): Voclist
        group(groupId: String!): Group
        words(voclistId: String!): [Word!]
        getImages(word: String!, lang: String!): [String!]
        getVoices: [Voice]
        getExamples(from: String!, to: String, fromLang: String!, toLang: String!): [Sentence!]
    }

    type Mutation{
        updateVoclist(list: VoclistInput!, changedBlobs: [String!], oid: String!, lastUpdated: String!): Boolean
        addSharedVoclist(userId: String!, vocId: String!): Boolean
        deleteVoclist(userId: String!, vocId: String!, lastUpdated: String!): Boolean
        saveImg(img: String!): String!
        removeImgs(imgs: [String!]): Boolean
        copyImgs(imgs: [String]): [String]
        createGroup(groupInfo: GroupInput!, userId: String!, lastUpdated: String!): String
        addVoclistToGroup(groupId: String!, vocId: String!): Boolean
        removeVoclistFromGroup(groupId: String!, vocId: String!): Boolean
        addUserToGroup(userId: String!, groupId: String!, lastUpdated:String!): String
        removeUserFromGroup(userId: String!, groupId: String!, lastUpdated: String!): Boolean
        copyVoclist(voclistId: String!, userId: String!, lastUpdated:String!): Voclist
        changeProfilePic(userId: String!, newImg: String!, lastUpdated:String!): Boolean
    }

    type User @entity{
        _id: ID! @id
        voclists: [BasicVoclist!] @link
        groups: [Group!] @link
        lastUpdated: String @column
        profilePic: String @column
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

    type BasicVoclist @entity{
        _id: ID! @id
        settings: VoclistSettings! @embedded
        lastEdited: String! @column
        wordsLength: Int! @column
        creator: String! @column
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
        img: String @column
        toAudio: String @column
        sentences: [Sentence!] @embedded
    }

    input WordInput{
        from: String!
        to: String!
        img: String
        toAudio: String
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

    type Group @entity{
        _id: ID! @id
        name: String! @column
        description: String @column
        members: [User!] @link
        voclists: [BasicVoclist!] @link
    }

    input GroupInput{
        name: String!
        description: String!
    }
`;