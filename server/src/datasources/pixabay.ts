import {RESTDataSource} from 'apollo-datasource-rest';

export class PixabayAPI extends RESTDataSource {
    baseURL: string;


    constructor() {
        super();
        require('dotenv').config()
        this.baseURL = "https://pixabay.com/api/";
    }

    /**
     * get images from pixabay
     * @param word the word we want to search images fos
     * @param lang the language the word is in
     * @return an array of image urls of length 12
     */
    async getImages(word: string, lang: string): Promise<string[]> {
        if (word == "" || lang == "") return [];
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
