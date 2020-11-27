import {ref} from "@vue/composition-api";

export function useServiceWorkerRefresher() {
    const updateExists = ref(false);
    document.addEventListener('swUpdated', showRefreshUI, {once: true});

    function showRefreshUI(e) {
        updateExists.value = true;
    }

    return {updateExists}
}