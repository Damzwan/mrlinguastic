/**
 * @param code the country code in ISO 3166-2 format
 * @return the country matching the country code
 */
export const getCountry = function (code: string){
    const items = {en: "united-kingdom", fr: "france", it: "italy", nl: "belgium"}
    return items[code];
}

/**
 * @param code the country code in ISO 3166-2 format
 * @return an example word matching the country code
 */
export const getExampleWord = function (code: string){
    const items = {en: "hello", fr: "bonjour", it: "ciao", nl: "hallo"}
    return items[code];
}