import M from "materialize-css";
import moment from "moment";
import {BasicVoclist, Voclist, Word} from "@/gen-types";

export interface Community {
    _id: string,
    country: string,
    name: string
}

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

export function removeAllToasts() {
    M.Toast.dismissAll();
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
export const getCountry = function (code: string) {
    const items = {
        "en": "united-kingdom",
        "fr": "france",
        "it": "italy",
        "nl": "netherlands",
        "de": "germany",
        "pt": "portugal",
        "es": "spain",
        "ro": "romania",
        "ru": "russia"
    }
    return items[code];
}

export const getLang = function (code: string) {
    const items = {
        "en": "english",
        "fr": "french",
        "it": "italian",
        "nl": "dutch",
        "de": "german",
        "pt": "portugese",
        "es": "spanish",
        "ro": "romanian",
        "ru": "russian"
    }
    return items[code];
}

/**
 * @param code the country code in ISO 3166-2 format
 * @return an example word matching the country code
 */
export const getExampleWord = function (code: string) {
    const items = {
        "en": "hello",
        "fr": "bonjour",
        "it": "ciao",
        "nl": "hallo",
        "de": "hallo",
        "pt": "olá",
        "es": "hola",
        "ro": "salut",
        "ru": "Здравствуйте"
    }
    return items[code];
}

export const getSymbols = function (code: string) {
    const items = {
        "en": [],
        "fr": ["é", "è", "ç", "à", "ù", "ê", "â", "î", "ô", "û", "ë", "ï", "ü"],
        "it": ["à", "è", "é", "ì", "ò", "ó", "ù"],
        "nl": [],
        "de": ["ä", "ö", "ü", "é", "ß"],
        "pt": ["ã", "á", "à", "â", "ç", "é", "ê", "í", "õ", "ó", "ô", "ú", "ü"],
        "es": ["á", "é", "í", "ó", "ú", "ü", "ñ", "¿"],
        "ro": ["ă", "â", "î", "ș", "ş", "ț", "ţ"],
        "ru": ["🤣🤣🤣"]
    }
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
    const symbols = [". ", "?", "!", ".", ",", ')', "(", "- ", " -", '"', "/", "|", "%", ":", "="];
    let newWord = word.toLowerCase().replace(/[0-9]/g, '').replace(/\s+$/, '');

    for (const symbol of symbols)
        newWord = newWord.split(symbol).join('')

    newWord = newWord.replace(/\\/g, "");
    return newWord.trim();
}

export function isOfflineList() {
    return localStorage.getItem("isOfflineList") != null;
}

export function formatDate(date: string) {
    return moment(new Date(date)).format("lll");
}

const communities: Community[] = [
    {_id: "5fbfb3abf21c541728fd3af6", country: "netherlands", name: "Dutch"},
    {_id: "5fbfb207f21c541728fd3af3", country: "united-kingdom", name: "English"}, {
    _id: "5fbfb248f21c541728fd3af4", country: "france", name: "French"},
    {_id: "600d8e19e8058e12582bcdda", country: "germany", name: "German"},
    {_id: "5fbfb270f21c541728fd3af5", country: "italy", name: "Italian"},
    {_id: "600d8de5e8058e12582bcdd9", country: "portugal", name: "Portuguese"},
    {_id: "600d907ae8058e12582bcddc", country: "romania", name: "Romanian"},
    {_id: "600d94b4e8058e12582bcddd", country: "russia", name: "Russian"},
    {_id: "600d8f92e8058e12582bcddb", country: "spain", name: "Spanish"},
]

export function getCommunity(id: string) {
    for (const community of communities)
        if (community._id == id) return community;
    return null;
}

export function getCommunities() {
    return communities;
}

export function convertToBasicVoclist(list: Voclist): BasicVoclist {
    return {
        _id: list._id,
        lastEdited: list.lastEdited,
        wordsLength: list.words.length,
        creator: list.creator,
        settings: list.settings
    }
}

export function convertToNormalVoclist(list: BasicVoclist): Voclist {
    return {
        _id: list._id,
        lastEdited: list.lastEdited,
        words: new Array<Word>(list.wordsLength),
        creator: list.creator,
        settings: list.settings
    }
}

export function newLastUpdated() {
    const date = new Date().toISOString();
    localStorage.setItem("lastUpdated", date);
    return date;
}

export function getLastUpdated() {
    return localStorage.getItem("lastUpdated")
}

export function isLarge(): boolean {
    return window.innerWidth > 1200;
}

