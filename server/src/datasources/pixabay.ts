import { RESTDataSource } from 'apollo-datasource-rest';

export class PixabayAPI extends RESTDataSource {
    baseURL: string;


    constructor() {
        super();
        require('dotenv').config()
        this.baseURL = "https://pixabay.com/api/";
    }

    async getImages(word: string, lang: string) {
        const data = await this.get(`?key=${process.env.PIXABAY_KEY}&q=${encodeURIComponent(word)}&lang=${encodeURIComponent(lang)}&image_type=photo`)

        const imgUrls = [];
        if (data["hits"].length != 0) {
            for (let i = 0; i < 12; i++) {
                if (data["hits"][i] != null) imgUrls.push(data["hits"][i]["webformatURL"])
            }
        }
        return imgUrls;
    }

}
