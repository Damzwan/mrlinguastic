const mongoose = require("mongoose");
// const env = require("../../environment")

mongoose.Promise = global.Promise;

const mongoUri = `mongodb://26584c8d-0ee0-4-231-b9ee:Zc5dwD0LkJONrrzmS9xWVDcM15HggeG069q0OzfS7JqWyaH1ZqgrgX4la3LnPXc7piaEA3YyP88hdlS8jgCBmg==@26584c8d-0ee0-4-231-b9ee.documents.azure.com:10255/?ssl=true&replicaSet=globaldb`

async function connect(){
    return mongoose.connect(mongoUri, {useNewUrlParser: true, useUnifiedTopology: true})
}

module.exports = {
    connect,
    mongoose
}