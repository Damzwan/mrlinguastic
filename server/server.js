const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

const { graphqlHTTP } = require('express-graphql');
const { buildSchema } = require("graphql");
const bodyParser = require('body-parser');

const mongo = require("./services/database/mongo");
const Voclist = require("./services/database/models/voclist");

// app.use(express.static(__dirname + "/dist/"));

// app.get('/', function (req, res) {
//     res.sendFile(__dirname + '/dist/main.html');
// });

let port = process.env.PORT;
if (port == null || port == "") port = 3000;

mongo.connect().then(() => {
    http.listen(port, function () {
        console.log('listening on *:' + port);
    });
}).catch(err => console.log(err))

app.use(bodyParser.json())
app.use("/api", graphqlHTTP({
    schema: buildSchema(`

        type Voclist {
            title: String!
            from: String!
            to: String!
            words: [VocItem]
        }

        input VoclistInput {
            title: String!,
            from: String!
            to: String!
            words: [VocItemInput]
        }

        input VocItemInput {
            from: String!
            to: String!
        }

        type VocItem {
            from: String
            to: String
        }

        type rootQuery {
            voclists: [Voclist!]!
        }

        type rootMutation {
            createVoclist(listInput: VoclistInput): Voclist
        }

        schema{
            query: rootQuery
            mutation: rootMutation
        }
    `),
    rootValue: {
        voclists: () => { return Voclist.find().then(voclists => {
            return voclists.map(voclist => {
                return {...voclist._doc}
            })
        }) },
        createVoclist: (args) => {
            const list = new Voclist({
                title: args.listInput.title,
                from: args.listInput.from,
                to: args.listInput.to,
                words: args.listInput.words
            })
            return list.save().then(result => {
                return { ...result._doc }
            })
        }
    },
    graphiql: true
}))

io.on('connection', function (socket) {
    console.log("connected!")
});