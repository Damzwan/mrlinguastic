import {DataSource} from 'apollo-datasource';

require('dotenv').config()

//translation
import request from 'request';
import {v4 as uuidv4} from 'uuid';
import {ContainerClient} from "@azure/storage-blob/typings/3.1/storage-blob";

//text to speech
const rp = require('request-promise');
const xmlbuilder = require('xmlbuilder');

//Blob Storage
const {BlobServiceClient} = require('@azure/storage-blob');
import fetch from 'node-fetch';

export class azureAPI extends DataSource {
    imagesContainerClient: ContainerClient;
    audioContainerClient: ContainerClient;

    constructor() {
        super();
        const blobServiceClient = BlobServiceClient.fromConnectionString(process.env.BLOB_KEY);
        this.imagesContainerClient = blobServiceClient.getContainerClient("images");
        this.audioContainerClient = blobServiceClient.getContainerClient("audio");
    }

    /**
     * Translate a word
     * @param word the word to be translated
     * @param from the language to be translated from
     * @param to the language to be translated to
     * @return the translated word
     */
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
                resolve(body[0]["translations"][0]["text"]); //TODO maybe we should send multiple possible translations as well
            });
        });
    }

    /**
     * Get the speech for a word and send it back to the one requesting it
     * @param word the word we want the speech from
     * @param lang the language we want the speech in
     * @param voice the voice of the speech
     * @param res used to send back the response
     */
    async textToSpeech(word: string, lang: string, voice: string, res: any) {
        const accessToken = await this.getAccessToken(process.env.TTS_KEY);
        // Create the SSML request.
        let xml_body = xmlbuilder.create('speak')
            .att('version', '1.0')
            .att('xml:lang', voice.substring(0, 5))
            .ele('voice')
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

    //get a list of all possible voices for text to speech
    async getVoices(): Promise<any []> {
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

    async saveBlob(url: string, containerName: string) {
        if (url.substring(0, 5) != "https") return url; //blob already saved
        const buffer = await fetch(url).then(r => r.arrayBuffer());
        const blobName = uuidv4(); // Create a unique name for the blob
        const container = containerName == "audio" ? this.audioContainerClient : this.imagesContainerClient;
        const blockBlobClient = container.getBlockBlobClient(blobName); // Get a block blob client
        const uploadBlobResponse = await blockBlobClient.upload(buffer, buffer.byteLength);
        console.log("Blob was uploaded successfully. requestId: ", uploadBlobResponse.requestId);
        return blobName;
    }

    copyBlob(blob: string | null): string | null {
        if (!blob) return null;
        const blobName = uuidv4(); // Create a unique name for the blob
        const sourceBlob = this.imagesContainerClient.getBlobClient(blob);
        const blockBlobClient = this.imagesContainerClient.getBlockBlobClient(blobName); // Get a block blob client
        blockBlobClient.beginCopyFromURL(sourceBlob.url).then();
        return blobName;
    }

    deleteBlob(blobName: string, containerName: string) {
        const container = containerName == "audio" ? this.audioContainerClient : this.imagesContainerClient;
        container.deleteBlob(blobName).then(() => console.log("deleted: " + blobName));
    }


}
