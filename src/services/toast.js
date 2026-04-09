let toastCallback = null

export function registerToast(callback) {
  toastCallback = callback
}

export function toast(message, type = 'success', duration = 3000) {
  if (toastCallback) {
    toastCallback({ message, type, duration, id: Date.now() })
  }
}

export const notify = {
  success: (msg) => toast(msg, 'success'),
  error: (msg) => toast(msg, 'error'),
  info: (msg) => toast(msg, 'info'),
  warning: (msg) => toast(msg, 'warning'),
}