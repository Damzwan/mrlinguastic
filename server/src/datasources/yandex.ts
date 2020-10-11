import {RESTDataSource} from "apollo-datasource-rest";

require('dotenv').config()

export class YandexAPI extends RESTDataSource {

    constructor() {
        super();
        this.baseURL = "https://dictionary.yandex.net/api/v1/dicservice.json"
    }

    async dictionaryLookup(word: string, from: string, to: string): Promise<string[]> {
        const data = await this.get(`lookup?key=${process.env.YANDEX_KEY}&lang=${from}-${to}&text=${word}`)
        if (data && data.def) {
            let possibleTranslations = [];
            for (const option of data.def)
                possibleTranslations = possibleTranslations.concat(option.tr.map(item => item.text));
            return possibleTranslations;
        } else return null;
    }
}
