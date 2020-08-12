export const getCountry = function (code: string){
    const items = {en: "united-kingdom", fr: "france", it: "italy", nl: "belgium"}
    return items[code];
}

export const getExampleWord = function (code: string){
    const items = {en: "hello", fr: "bonjour", it: "ciao", nl: "hallo"}
    return items[code];
}