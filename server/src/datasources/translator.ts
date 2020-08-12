import { DataSource } from 'apollo-datasource';
import request from 'request';
import { v4 as uuidv4 } from 'uuid';
require('dotenv').config()

export class TranslatorAPI extends DataSource {

    constructor() {
        super();
    }

    async translateWord(word: string, from: string, to: string): Promise<string> {
        let options = {
            method: 'POST',
            baseUrl: "https://api.cognitive.microsofttranslator.com/translate?api-version=3.0",
            url: 'translate',
            qs: {
                'api-version': '3.0',
                'from': from,
                'to': [to]
            },
            headers: {
                'Ocp-Apim-Subscription-Key': process.env.TRANSLATOR_KEY,
                'Content-type': 'application/json',
                'X-ClientTraceId': uuidv4().toString()
            },
            body: [{
                'text': word,
            }],
            json: true,
        };

        var data: any;
        const translatePromise = new Promise(resolve => {
            request(options, function (err, res, body) {
                data = body[0]["translations"][0]["text"];
                resolve();
            });
        });
        await translatePromise;
        return data;
    }

}
