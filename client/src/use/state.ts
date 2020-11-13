import {computed, inject, reactive} from "@vue/composition-api";
import {User, Voclist} from "@/gen-types";
import {Localdb} from "@/use/localdb";
import {getCommunity} from "@/use/general";

export interface BasicGroupInfo {
    _id: string;
    name: string;
}

interface State {
    user: User | null
    downloadedLists: Voclist[] | null,
    event: string | null
}

const state = reactive<State>({
    user: null,
    downloadedLists: null,
    event: null
})

function setUser(newUser: User) {
    state.user = newUser
}

function setDownloadedLists(lists: Voclist[]) {
    state.downloadedLists = lists;
}

function replaceDownloadedVoclist(i: number, list: Voclist) {
    state.downloadedLists[i] = list;
    console.log(state.downloadedLists[i])
}

function replaceList(newList: Voclist) {
    for (let i = 0; i < state.user.voclists.length; i++) {
        if (state.user.voclists[i]._id == newList._id) {
            state.user.voclists[i] = newList;
            return;
        }
    }
    addVoclist(newList);
}

function addVoclist(list: Voclist) {
    state.user.voclists.push(list);
}

function removeVoclistFromState(list: Voclist) {
    state.user.voclists.splice(state.user.voclists.indexOf(list), 1);
}

function addGroup(group: BasicGroupInfo) {
    for (let i = 0; i < state.user.groups.length; i++)
        if (state.user.groups[i]._id == group._id) return;
    state.user.groups.push(group);
}

function removeGroup(groupId: string) {
    for (let i = 0; i < state.user.groups.length; i++)
        if (state.user.groups[i]._id == groupId) state.user.groups.splice(i, 1);
}

function sendEvent(msg: string | null) {
    state.event = msg;
}

const userLists = computed(() => state.user ? state.user.voclists : null);

const groups = computed(() => state.user ? state.user.groups.filter(group => !getCommunity(group._id)) : null);
const communities = computed(() => state.user ? state.user.groups
    .filter(group => getCommunity(group._id)).map(group => getCommunity(group._id)) : null)

const downloadedLists = computed(() => state.downloadedLists)

const event = computed(() => state.event)

export {
    setUser,
    userLists,
    addVoclist,
    addGroup,
    replaceList,
    removeGroup,
    removeVoclistFromState,
    groups,
    communities,
    downloadedLists,
    setDownloadedLists,
    replaceDownloadedVoclist,
    event,
    sendEvent
}