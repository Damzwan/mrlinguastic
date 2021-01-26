import {useGetWordsQueryLazy} from "@/use/lazyQueries";
import {getOnlineListFromState} from "@/use/state";
import {BasicVoclist, Voclist} from "@/gen-types";
import {inject, unref, watch} from "@vue/composition-api";
import {Localdb} from "@/use/localdb";
import {AuthModule} from "@/use/authModule";

export function useVoclistUpdater() {

    const {load: getWords, result: words, loading} = useGetWordsQueryLazy();
    const db = inject<Localdb>("db");
    const auth = inject<AuthModule>("auth");

    async function updateVoclist(vocId: string) {
        const listFromState = getOnlineListFromState(vocId);
        let offlineList: Voclist | null = await db.getItem<Voclist>(vocId, "voclists")

        if ((!listFromState || !auth.getOid().value) && offlineList.lastEdited) return offlineList; //online lists not yet fetched, we rely on a offline copy
        if (offlineList.lastEdited && new Date(listFromState.lastEdited) <= new Date(offlineList.lastEdited)) return offlineList //no update is needed

        getWords(null, {vocId: listFromState._id})

        return await new Promise<Voclist>((resolve) => {
            watch(words, () => {
                if (!offlineList) offlineList = {
                    _id: vocId,
                    settings: listFromState.settings,
                    words: words.value.words,
                    lastEdited: listFromState.lastEdited,
                    creator: listFromState.creator
                }
                else {
                    offlineList.words = words.value.words;
                    offlineList.lastEdited = listFromState.lastEdited;
                }
                db.save("voclists", offlineList)
                resolve(offlineList);
            })
        })
    }

    async function createVoclistFromBasic(list: BasicVoclist) {
        getWords(null, {vocId: list._id})

        return await new Promise<Voclist>((resolve) => {
            watch(words, () => {
                resolve({
                    _id: list._id,
                    settings: list.settings,
                    creator: list.creator,
                    words: words.value.words,
                    lastEdited: list.lastEdited
                });
            })
        })
    }

    return {updateVoclist, createVoclistFromBasic}
}