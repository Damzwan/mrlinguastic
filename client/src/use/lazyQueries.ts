import * as VueCompositionApi from "@vue/composition-api";
import * as VueApolloComposable from "@vue/apollo-composable";
import {
    GetBasicGroupInfoDocument,
    GetBasicGroupInfoQuery,
    GetBasicGroupInfoQueryVariables, GetUserDocument, GetUserQuery, GetUserQueryVariables,
    GetVoclistDocument,
    GetVoclistQuery,
    GetVoclistQueryVariables,
    ReactiveFunction
} from "@/gen-types";

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