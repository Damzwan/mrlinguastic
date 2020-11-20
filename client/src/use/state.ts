import {computed, inject, reactive} from "@vue/composition-api";
import {BasicVoclist, Group, User, Voclist} from "@/gen-types";
import {Localdb} from "@/use/localdb";
import {getCommunity} from "@/use/general";

export interface BasicGroupInfo {
    _id: string;
    name: string;
}

interface State {
    groups: Group[]
    onlineVoclists: BasicVoclist[] | null
    downloadedLists: Voclist[] | null,
    event: string | null
}

const state = reactive<State>({
    groups: null,
    onlineVoclists: null,
    downloadedLists: null,
    event: null
})

function setUser(newUser: User) {
    state.groups = newUser.groups;
    state.onlineVoclists = newUser.voclists
}

function setDownloadedLists(lists: Voclist[]) {
    state.downloadedLists = lists;
}

function replaceDownloadedVoclist(i: number, list: Voclist) {
    state.downloadedLists[i] = list;
}

function replaceList(newList: Voclist) {
    for (let i = 0; i < state.onlineVoclists.length; i++) {
        if (state.onlineVoclists[i]._id == newList._id) {
            state.onlineVoclists[i].wordsLength = newList.words.length;
            state.onlineVoclists[i].settings = newList.settings;
            return;
        }
    }
    addVoclist(newList);
}

function addVoclist(list: Voclist) {
    state.onlineVoclists.push({
        _id: list._id,
        creator: list.creator,
        lastEdited: list.lastEdited,
        wordsLength: list.words.length,
        settings: list.settings
    });
}

function removeVoclistFromState(list: Voclist) {
    for (let i = 0; i < state.onlineVoclists.length; i++) {
        if (state.onlineVoclists[i]._id == list._id) {
            state.onlineVoclists.splice(i, 1);
            return;
        }
    }
}

function addGroup(group: BasicGroupInfo) {
    for (let i = 0; i < state.groups.length; i++)
        if (state.groups[i]._id == group._id) return;
    state.groups.push(group);
}

function removeGroup(groupId: string) {
    for (let i = 0; i < state.groups.length; i++)
        if (state.groups[i]._id == groupId) state.groups.splice(i, 1);
}

function sendEvent(msg: string | null) {
    state.event = msg;
}

function getOnlineListFromState(id: string) {
    if (!userLists.value) return null;
    for (let i = 0; i < userLists.value.length; i++)
        if (userLists.value[i]._id == id) return userLists.value[i]
    return null;
}

const userLists = computed(() => state.onlineVoclists ? state.onlineVoclists : null);

const groups = computed(() => state.groups ? state.groups.filter(group => !getCommunity(group._id)) : null);
const communities = computed(() => state.groups ? state.groups
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
    sendEvent,
    getOnlineListFromState
}