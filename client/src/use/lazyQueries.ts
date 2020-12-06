import * as VueCompositionApi from "@vue/composition-api";
import * as VueApolloComposable from "@vue/apollo-composable";
import {
    GetBasicGroupInfoDocument,
    GetBasicGroupInfoQuery,
    GetBasicGroupInfoQueryVariables,
    GetExamplesDocument,
    GetExamplesQuery,
    GetExamplesQueryVariables, GetImagesDocument,
    GetImagesQuery,
    GetImagesQueryVariables, GetLastUpdatedDocument, GetLastUpdatedQuery, GetLastUpdatedQueryVariables,
    GetUserDocument,
    GetUserQuery,
    GetUserQueryVariables,
    GetVoclistDocument,
    GetVoclistQuery,
    GetVoclistQueryVariables, GetWordsDocument, GetWordsQuery, GetWordsQueryVariables,
    ReactiveFunction,
    TranslateWordDocument,
    TranslateWordQuery,
    TranslateWordQueryVariables,
    TranslateWordsDocument,
    TranslateWordsQuery,
    TranslateWordsQueryVariables
} from "@/gen-types";
import {Ref} from "@vue/composition-api";

//This file contains lazyQuery variants of the useQuery function that are code generated. Maybe check if codegen supports useLazyQuery later down the line
//this is a temporary fix

export function useGetVoclistQueryLazy() {
    return VueApolloComposable.useLazyQuery<GetVoclistQuery, GetVoclistQueryVariables>(GetVoclistDocument);
}

export function useGetBasicGroupInfoQueryLazy() {
    return VueApolloComposable.useLazyQuery<GetBasicGroupInfoQuery, GetBasicGroupInfoQueryVariables>(GetBasicGroupInfoDocument);
}

export function useGetUserQueryLazy() {
    return VueApolloComposable.useLazyQuery<GetUserQuery, GetUserQueryVariables>(GetUserDocument);
}

export function useTranslateWordQueryLazy() {
    return VueApolloComposable.useLazyQuery<TranslateWordQuery, TranslateWordQueryVariables>(TranslateWordDocument);
}

export function useTranslateWordsQueryLazy() {
    return VueApolloComposable.useLazyQuery<TranslateWordsQuery, TranslateWordsQueryVariables>(TranslateWordsDocument);
}

export function useGetExamplesQueryLazy() {
    return VueApolloComposable.useLazyQuery<GetExamplesQuery, GetExamplesQueryVariables>(GetExamplesDocument, null, {fetchPolicy: "network"});
}

export function useGetImagesQueryLazy() {
    return VueApolloComposable.useLazyQuery<GetImagesQuery, GetImagesQueryVariables>(GetImagesDocument);
}

export function useGetWordsQueryLazy() {
    return VueApolloComposable.useLazyQuery<GetWordsQuery, GetWordsQueryVariables>(GetWordsDocument);
}

export function useGetLastUpdatedQueryLazy() {
    return VueApolloComposable.useLazyQuery<GetLastUpdatedQuery, GetLastUpdatedQueryVariables>(GetLastUpdatedDocument);
}