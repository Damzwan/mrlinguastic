import {DataSource} from 'apollo-datasource';

require('dotenv').config()

//translation
import request from 'request';
import {v4 as uuidv4} from 'uuid';

//text to speech
const rp = require('request-promise');
const xmlbuilder = require('xmlbuilder');


const langToCountryCode = {
    "it": "IT",
    "fr": "fr",
    "en": "GB",
    "ro": "RO",
    "nl": "NL",
    "ja": "JP",
    "es": "ES",
    "ko": "KR"
}


export class azureAPI extends DataSource {

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

        return await new Promise(resolve => {
            request(options, function (err, res, body) {
                resolve(body[0]["translations"][0]["text"]);
            });
        });
    }

    async textToSpeech(word: string, lang: string, voice: string, res: any) {
        const subscriptionKey = "525103ae078d47f8b501773323b2b2bc";
        const accessToken = await this.getAccessToken(subscriptionKey);
        // Create the SSML request.
        let xml_body = xmlbuilder.create('speak')
            .att('version', '1.0')
            .att('xml:lang', lang + "-" + lang)
            .ele('voice')
            .att('xml:lang', lang + "-" + lang)
            .att('name', voice)
            .txt(word)
            .end();
        // Convert the XML into a string to send in the TTS request.
        let body = xml_body.toString();

        let options = {
            method: 'POST',
            baseUrl: 'https://westeurope.tts.speech.microsoft.com/',
            url: 'cognitiveservices/v1',
            headers: {
                'Authorization': 'Bearer ' + accessToken,
                'cache-control': 'no-cache',
                'User-Agent': 'LLNSpeech',
                'X-Microsoft-OutputFormat': 'audio-16khz-64kbitrate-mono-mp3',
                'Content-Type': 'application/ssml+xml'
            },
            body: body
        }

        let request = rp(options)
            .on('response', (response) => {
                if (response.statusCode === 200) {
                    request.pipe(res);
                }
            });
    }

    async getAccessToken(subscriptionKey) {
        let options = {
            method: 'POST',
            uri: 'https://westeurope.api.cognitive.microsoft.com/sts/v1.0/issuetoken',
            headers: {
                'Ocp-Apim-Subscription-Key': subscriptionKey
            }
        }
        return rp(options);
    }

    async getVoices() : Promise<any []>{
        const subscriptionKey = "525103ae078d47f8b501773323b2b2bc";
        const accessToken = await this.getAccessToken(subscriptionKey);

        let options = {
            method: 'GET',
            url: 'https://westeurope.tts.speech.microsoft.com/cognitiveservices/voices/list',
            headers: {
                'Authorization': 'Bearer ' + accessToken
            },
        }
        const voices = await rp(options);
        return JSON.parse(voices)
    }

    // synthesizeSpeech() {
    //     const speechConfig = sdk.SpeechConfig.fromSubscription("525103ae078d47f8b501773323b2b2bc", "westeurope");
    //     const synthesizer = new sdk.SpeechSynthesizer(speechConfig);
    //
    //     synthesizer.speakTextAsync(
    //         "Getting the response as an in-memory stream.",
    //         result => {
    //             // Interact with the audio ArrayBuffer data
    //             const audioData = result.audioData;
    //             console.log(`Audio data byte size: ${audioData.byteLength}.`)
    //             synthesizer.close();
    //         },
    //         error => {
    //             console.log(error);
    //             synthesizer.close();
    //         });
    // }

}
