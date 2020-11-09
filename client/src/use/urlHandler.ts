import {useGetBasicGroupInfoQueryLazy, useGetVoclistQueryLazy} from "@/use/lazyQueries";
import {useAddUserToGroupMutation, useCopyVoclistMutation, Voclist} from "@/gen-types";
import {addGroup, addVoclist, BasicGroupInfo} from "@/use/state";
import {correctMessage, wrongMessage} from "@/use/general";
import {inject, watch} from "@vue/composition-api";
import {Localdb} from "@/use/localdb";

export function useUrlHandler() {
    const {result: voclist, load: getVoclist} = useGetVoclistQueryLazy();
    const {result: group, load: getGroup} = useGetBasicGroupInfoQueryLazy();

    const {mutate: copyVoclist} = useCopyVoclistMutation({});
    const {mutate: addUserToGroup} = useAddUserToGroupMutation({});

    const db = inject<Localdb>("db")

    async function getSharedVoclistOnline(voclistId: string) {
        const voclist = await copyVoclist({voclistId: voclistId})
        if (voclist) {
            addVoclist(voclist.data?.copyVoclist as Voclist);
            correctMessage("added voclist");
        } else wrongMessage("list does not exist");
    }

    async function getSharedVoclistOffline(voclistId: string) {
        getVoclist(null, {voclistId: voclistId});
        watch(voclist, async () => {
            if (voclist.value) {
                addVoclist(voclist.value.voclist as Voclist);
                await db.save("voclists", voclist.value.voclist as Voclist)
                await db.addListToUser(voclistId);
                correctMessage("added voclist");
            } else wrongMessage("list does not exist");
        })
    }

    async function getSharedGroupOnline(groupId: string, userId: string) {
        const group = await addUserToGroup({userId: userId, groupId: groupId});
        if (group.data.addUserToGroup) {
            addGroup({_id: groupId, name: group.data.addUserToGroup});
            correctMessage("added group!");
        } else wrongMessage("group does not exist");
    }

    async function getSharedGroupOffline(groupId: string) {
        getGroup(null, {groupId: groupId});
        watch(group, async () => {
            if (group.value) {
                addGroup({_id: groupId, name: group.value.group.name});
                await db.addGroupToUser({_id: groupId, name: group.value.group.name});
                correctMessage("added group!");
            } else wrongMessage("group does not exist");
        })
    }

    async function checkForSharedItems(userId: string) {
        const sharedLink = window.location.search;
        if (!sharedLink) return;
        const voclistId = new URLSearchParams(sharedLink).get("oid");
        const groupId = new URLSearchParams(sharedLink).get("groupId");

        if (userId) await Promise.all([voclistId ? getSharedVoclistOnline(voclistId) : null,
            groupId ? getSharedGroupOnline(groupId, userId) : null]);
        else await Promise.all([voclistId ? getSharedVoclistOffline(voclistId) : null,
            groupId ? getSharedGroupOffline(groupId) : null])

        window.history.replaceState({}, document.title, "/#/"); //remove url parameters
    }

    return {checkForSharedItems}

}