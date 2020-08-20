import {useGetImagesQuery, useTranslateWordQuery, useTranslateWordsQuery} from "@/gen-types";
import {useGlobalQueryLoading, useQuery, useResult} from "@vue/apollo-composable";


//TODO we should use a subscription maybe

/**
 * @usage use await executeTranslate first, the result will be stored in translatedWord
 * @return Object => translatedWord: the value of the translation, executeTranslate: a function to execute the translation
 */
export function useTranslate() {
    const {result, refetch} = useTranslateWordQuery({word: "First", fromLang: "en", toLang: "en",});
    return {translatedWord: result, executeTranslate: refetch}
}

/**
 * @usage use await executeTranslate first, the result will be stored in translatedWords
 * @return Object => translatedWords: an array of translated words, executeTranslate: a function to execute the translation again
 */
export function useTranslateMultiple() {
    const {result, refetch} = useTranslateWordsQuery({words: ["First"], fromLang: "en", toLang: "en"})
    return {translatedWords: result, executeTranslate: refetch}
}

/**
 * @usage use await executeImageSearch first, the result will be stored in imgUrls
 * @return Object => imgUrls: an array of image urls, executeImageSearch: a function to execute the image search
 */
export function useImageSearch() {
    const {result, refetch} = useGetImagesQuery({word: "elephant", lang: "en"});
    return {imgUrls: result, executeImageSearch: refetch}
}

/**
 * Clean a word from possible mistakes such as symbols, spaces etc
 * @param word the word to be cleaned
 * @return the cleaned word
 */
export function cleanWord(word: string) {
    const symbols = [". ", "?", "!", ".", ",", ')', "(", "- ", " -", "'", '"', "/", "|", "%", ":", "="];
    let newWord = word.toLowerCase().replace(/[0-9]/g, '').replace(/\s+$/, '');

    for (const symbol of symbols) {
        newWord = newWord.split(symbol).join('')
    }
    newWord = newWord.replace(/\\/g, "");
    return newWord;
}