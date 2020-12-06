import {useGetBasicGroupInfoQueryLazy, useGetVoclistQueryLazy} from "@/use/lazyQueries";
import {useAddUserToGroupMutation, useCopyImgsMutation, useCopyVoclistMutation, Voclist} from "@/gen-types";
import {addGroup, addVoclist} from "@/use/state";
import {correctMessage, newLastUpdated, wrongMessage} from "@/use/general";
import {inject, watch} from "@vue/composition-api";
import {Localdb} from "@/use/localdb";
import {AuthModule} from "@/use/authModule";
import {v1 as uuidv1} from "uuid";

export function useUrlHandler() {
    const {result: voclist, load: getVoclist} = useGetVoclistQueryLazy();
    const {result: group, load: getGroup} = useGetBasicGroupInfoQueryLazy();

    const {mutate: copyImgs} = useCopyImgsMutation({});
    const {mutate: copyVoclist} = useCopyVoclistMutation({});
    const {mutate: addUserToGroup} = useAddUserToGroupMutation({});

    const db = inject<Localdb>("db")
    const auth = inject<AuthModule>("auth")

    async function getSharedVoclistOnline(voclistId: string) {
        const voclist = await copyVoclist({voclistId: voclistId, userId: auth.getOid().value, lastUpdated: newLastUpdated()})
        if (voclist) {
            addVoclist(voclist.data?.copyVoclist as Voclist);
            correctMessage("added voclist");
            await Promise.all([db.save("voclists", voclist.data?.copyVoclist as Voclist),
                db.addListToUser(voclist.data?.copyVoclist._id)])
        } else wrongMessage("list does not exist");
    }

    async function getSharedVoclistOffline(voclistId: string) {
        getVoclist(null, {voclistId: voclistId});
        watch(voclist, async () => {
            if (voclist.value) {
                const copy = voclist.value.voclist;
                copy._id = uuidv1();
                const copiedImgs = await copyImgs({imgs: copy.words.map(word => word.img ? word.img : null)});

                for (let i = 0; i < copy.words.length; i++)
                    copy.words[i].img = copiedImgs.data?.copyImgs[i];

                addVoclist(voclist.value.voclist as Voclist);
                await Promise.all([db.save("voclists", voclist.value.voclist as Voclist), db.addListToUser(copy._id)])
                correctMessage("added voclist");
            } else wrongMessage("list does not exist");
        })
    }

    async function getSharedGroupOnline(groupId: string, userId: string) {
        const group = await addUserToGroup({userId: userId, groupId: groupId, lastUpdated: newLastUpdated()});
        if (group.data.addUserToGroup) {
            addGroup({_id: groupId, name: group.data.addUserToGroup});
            correctMessage("added group!");
            await db.addGroupToUser({_id: groupId, name: group.data.addUserToGroup});
        } else wrongMessage("group does not exist");
    }

    async function getSharedGroupOffline(groupId: string) {
        getGroup(null, {groupId: groupId});
        watch(group, async () => {
            if (group.value) {
                addGroup({_id: groupId, name: group.value.group.name});
                correctMessage("added group!");
                await db.addGroupToUser({_id: groupId, name: group.value.group.name});
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