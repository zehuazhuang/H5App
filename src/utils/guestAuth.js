import { sendLoginToIOS } from '@/utils/iosBridge'

export function isGuestUser(currentUser) {
    return Number(currentUser?.isguest || 0) === 1
}

export function requireLoginForAction(currentUserStore, uiStore, options = {}) {
    if (!isGuestUser(currentUserStore.currentUser)) {
        return false
    }

    uiStore.openLoginDialog(() => {
        sendLoginToIOS(true)
    }, {
        title: options.title || 'Please log in',
        message: options.message || 'To ensure the normal operation of the function, please log in to your account first.',
        confirmText: options.confirmText || 'Log In',
        cancelText: options.cancelText || 'Later'
    })

    return true
}
