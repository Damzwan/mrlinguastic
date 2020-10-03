import {RESTDataSource} from "apollo-datasource-rest";

require('dotenv').config()

export class YandexAPI extends RESTDataSource {

    constructor() {
        super();
        this.baseURL = "https://dictionary.yandex.net/api/v1/dicservice.json"
    }

    async dictionaryLookup(word: string, from: string, to: string): Promise<string> {
        const data = await this.get(`lookup?key=${process.env.YANDEX_KEY}&lang=${from}-${to}&text=${word}`)
        if (data && data.def && data.def[0] && data.def[0].tr && data.def[0].tr[0] && data.def[0].tr[0].text) return data.def[0].tr[0].text
        else return null;
    }
}
