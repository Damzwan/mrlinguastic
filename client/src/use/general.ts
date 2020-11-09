import M from "materialize-css";
import moment from "moment";

export type langCode = "en" | "fr" | "it" | "nl"
type langMap = { [key in langCode]: string };

export function getBlobUrl(blobName: string) {
    if (blobName.substring(0, 5) == "https") return blobName;
    return `https://mrlinguasticblobs.blob.core.windows.net/images/${blobName}?sv=2019-12-12&ss=bfqt&srt=o&sp=rx&se=2021-08-28T20:58:09Z&st=2020-08-28T12:58:09Z&spr=https&sig=igpY0VHeNftYhjSiIVFKSdeAscwRCLVeVRH9VmOzu2Q=&_=1598623419376`
}

/**
 * Show a red error message
 * @param text the text of the message
 */
export function wrongMessage(text: string) {
    new M.Toast({html: text, classes: 'red darken-4 centered-img center', displayLength: 2000})
}

/**
 * Show a green error message
 * @param text the text of the message
 */
export function correctMessage(text: string) {
    new M.Toast({html: text, classes: 'green darken-4 centered-img center', displayLength: 2000})
}

/**
 * Show a normal error message
 * @param text the text of the message
 */
export function normalMessage(text: string) {
    new M.Toast({html: text, classes: 'centered-img center', displayLength: 2000})
}

/**
 * @param code the country code in ISO 3166-2 format
 * @return the country matching the country code
 */
export const getCountry = function (code: langCode) {
    const items: langMap = {"en": "united-kingdom", "fr": "france", "it": "italy", "nl": "belgium"}
    return items[code];
}

export const getLang = function (code: langCode) {
    const items: langMap = {"en": "english", "fr": "french", "it": "italian", "nl": "dutch"}
    return items[code];
}

/**
 * @param code the country code in ISO 3166-2 format
 * @return an example word matching the country code
 */
export const getExampleWord = function (code: langCode) {
    const items: langMap = {"en": "hello", "fr": "bonjour", "it": "ciao", "nl": "hallo"}
    return items[code];
}

export function isOffline() {
    return !navigator.onLine;
}

/**
 * Clean a word from possible mistakes such as symbols, spaces etc
 * @param word the word to nl cleaned
 * @return the cleaned word
 */
export function cleanWord(word: string) {
    const symbols = [". ", "?", "!", ".", ",", ')', "(", "- ", " -", "'", '"', "/", "|", "%", ":", "="];
    let newWord = word.toLowerCase().replace(/[0-9]/g, '').replace(/\s+$/, '');

    for (const symbol of symbols)
        newWord = newWord.split(symbol).join('')

    newWord = newWord.replace(/\\/g, "");
    return newWord;
}

export function isOfflineList() {
    return localStorage.getItem("isOfflineList") != null;
}

export function formatDate(date: string){
    return moment(new Date(date)).format("lll");
}
