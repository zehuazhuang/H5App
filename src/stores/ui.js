import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useUIStore = defineStore('ui', () => {
    const loading = ref(false)
    const toastMessage = ref('')
    const showComment = ref(false)
    const loginDialogVisible = ref(false)
    const loginDialogTitle = ref('Please log in')
    const loginDialogMessage = ref('To ensure the normal operation of the function, please log in to your account first.')
    const loginDialogConfirmText = ref('Log In')
    const loginDialogCancelText = ref('Cancel')
    const loginDialogAction = ref(null)

    function showLoading() {
        loading.value = true
    }

    function hideLoading() {
        loading.value = false
    }

    function showToast(message, duration = 1500) {
        toastMessage.value = message
        setTimeout(() => { toastMessage.value = '' }, duration)
    }

    function openComment() {
        showComment.value = true
    }

    function closeComment() {
        showComment.value = false
    }

    function openLoginDialog(action, options = {}) {
        loginDialogTitle.value = options.title || 'Please log in'
        loginDialogMessage.value = options.message || 'To ensure the normal operation of the function, please log in to your account first.'
        loginDialogConfirmText.value = options.confirmText || 'Log In'
        loginDialogCancelText.value = options.cancelText || 'Cancel'
        loginDialogAction.value = typeof action === 'function' ? action : null
        loginDialogVisible.value = true
    }

    function closeLoginDialog() {
        loginDialogVisible.value = false
        loginDialogAction.value = null
    }

    function confirmLoginDialog() {
        const action = loginDialogAction.value
        closeLoginDialog()
        action?.()
    }

    return {
        loading,
        showLoading,
        hideLoading,
        toastMessage,
        showToast,
        showComment,
        openComment,
        closeComment,
        loginDialogVisible,
        loginDialogTitle,
        loginDialogMessage,
        loginDialogConfirmText,
        loginDialogCancelText,
        openLoginDialog,
        closeLoginDialog,
        confirmLoginDialog
    }
})
