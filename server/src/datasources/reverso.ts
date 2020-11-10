import {DataSource} from "apollo-datasource";

const Reverso = require('reverso-api');


export class reversoAPI extends DataSource {

    reverso: any;

    constructor() {
        super();
        this.reverso = new Reverso();
    }

    async getExamples(from: string, to: string, fromLang: string, toLang: string) {
        const res = await this.reverso.getContext(from, fromLang, toLang)
        return res.filter(item => item.trgLang.includes(to)).map(item => {
            return {from: item.srcLang, to: [item.trgLang]}
        });
    }
}