import {ref} from "@vue/composition-api";

export function useServiceWorkerRefresher() {
    const refreshing = ref(false);
    const registration = ref(null);
    const updateExists = ref(false);

    document.addEventListener('swUpdated', showRefreshUI, {once: true});

    if (navigator.serviceWorker) {
        navigator.serviceWorker.addEventListener(
            'controllerchange', () => {
                if (refreshing.value) return;
                refreshing.value = true;
                window.location.reload();
            }
        );
    }

    function showRefreshUI(e) {
        registration.value = e.detail;
        updateExists.value = true;
    }

    function refreshApp() {
        updateExists.value = false;
        if (!registration.value || !registration.value.waiting) {
            return;
        }
        registration.value.waiting.postMessage('skipWaiting');
    }

    return {updateExists, refreshApp}
}