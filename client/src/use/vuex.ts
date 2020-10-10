import {computed} from "@vue/composition-api";
import {Vue} from "vue-property-decorator";
import {Voclist} from "@/gen-types";

export interface Group{
    _id: string;
    name: string;
}

interface State{
    groups: Group[],
    voclists: Voclist[]
}

const state = Vue.observable<State>({groups: [], voclists: []});

export function useState(){
    function setGroups(newGroups: Group[]) {
        state.groups = state.groups.concat(newGroups);
    }

    function addGroup(group: Group){
        state.groups.push(group);
    }

    function containsGroup(groupId: string) {
        for (let i = 0; i < state.groups.length; i++)
            if (state.groups[i]._id === groupId) return i;
        return -1;
    }

    function removeGroup(groupId: string){
        const index = containsGroup(groupId);
        if (index != -1) state.groups.splice(index, 1);
    }

    const getGroups = computed(() => state.groups);

    return  {
        setState: setGroups,
        addGroup,
        containsGroup,
        removeGroup,
        getGroups
    }
}