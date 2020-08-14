import {useGetImagesQuery, useTranslateWordQuery} from "@/gen-types";
import {useGlobalQueryLoading, useQuery, useResult} from "@vue/apollo-composable";

//TODO we should use a subscription maybe
export function useTranslate() {
    const {result, refetch} = useTranslateWordQuery({word: "First", fromLang: "en", toLang: "en",});
    return {translatedWord: result, executeTranslate: refetch}
}

export function useImageSearch() {
    const {result, refetch} = useGetImagesQuery({word: "elephant", lang: "en"});
    return {imgUrls: result, executeImageSearch: refetch}
}

export function cleanWord(word: string) {
    const symbols = [". ", "?", "!", ".", ",", ')', "(", "- ", " -", "'", '"', "/", "|", "%", ":"];
    let newWord = word.toLowerCase().replace(/[0-9]/g, '').replace(/\s+$/, '');

    for (const symbol of symbols) {
        newWord = newWord.split(symbol).join('')
    }
    newWord = newWord.replace(/\\/g, "");
    return newWord;
}