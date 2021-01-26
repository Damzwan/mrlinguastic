import {DataSource} from "apollo-datasource";

const Reverso = require('reverso-api');
const axios = require('axios');
const cheerio = require('cheerio');


export class reversoAPI extends DataSource {

    reverso: any;
    urls = {
        "contextUrl": "https://context.reverso.net/translation/",
        "spellCheckUrl": "https://orthographe.reverso.net/api/v1/Spelling",
        "synonymsUrl": "https://synonyms.reverso.net/synonym/",
        "translation": "https://api.reverso.net/translate/v1/translation",
        "voice": "https://voice.reverso.net/RestPronunciation.svc/v1/output=json/GetVoiceStream/"
    }

    constructor() {
        super();
        this.reverso = new Reverso();
    }

    async getExamples(from: string, to: string, fromLang: string, toLang: string) {
        const maxExampleAmount = 3;
        const res = await this.getContext(from, fromLang, toLang)
        return res.examples.filter(item => item.to.includes(to)).slice(0, maxExampleAmount).map(item => {
            return {from: item.from, to: [item.to]}
        });
    }

    getContext(text, from, to) {
        let url = this.urls.contextUrl + from.toLowerCase() + '-' + to.toLowerCase() + '/' + encodeURIComponent(text);

        return axios({
            method: 'GET',
            url: url,
            headers: {
                Accept: 'application/json, text/javascript, */*; q=0.01',
                Connection: 'keep-alive',
                'Content-Type': 'application/json; charset=UTF-8',
                Origin: 'https://reverso.net',
                'Sec-Fetch-Dest': 'empty',
                'Sec-Fetch-Mode': 'cors',
                'Sec-Fetch-Site': 'same-site'
            }
        }).then((response) => {
            const $ = cheerio.load(response.data);
            let examples = [];
            let translation = [];

            let fromExample = $('body').find('.example').find('div[class="src ltr"] > span[class="text"]').text().trim().split('\n');
            let toExample = $('body').find('.example').find('div[class="trg ltr"] > span[class="text"]').text().trim().split('\n');
            let toTranslation = $('body').find('div[id="translations-content"]').text().split('\n');

            for (let i = 0; i < fromExample.length; i++) {
                examples.push({
                    id: i,
                    from: fromExample[i].trimStart(),
                    to: toExample[i].trimStart()
                });
            }

            toTranslation.forEach(e => {
                let string = e.trim();
                if (string.length <= 0) return;
                translation.push(e.trim());
            });

            return {
                text: text,
                from: from,
                to: to,
                translation: translation.filter(e => e != text),
                examples: examples
            };

        }).catch((err) => { throw new Error('reverso.net did not respond or there are no context examples for the given text.\n' + err) });
    }
}