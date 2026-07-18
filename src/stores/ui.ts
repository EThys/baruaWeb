import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { ToastMessage, Notification } from '@/types'

export const useUIStore = defineStore('ui', () => {
  // ─── Toast notifications ─────────────────────────────────────────────────
  const toasts = ref<ToastMessage[]>([])

  function addToast(toast: Omit<ToastMessage, 'id'>) {
    const id = `toast-${Date.now()}`
    toasts.value.push({ ...toast, id, duration: toast.duration ?? 4000 })
    setTimeout(() => removeToast(id), toast.duration ?? 4000)
    return id
  }
  function removeToast(id: string) {
    toasts.value = toasts.value.filter(t => t.id !== id)
  }

  // Shortcut helpers
  const toast = {
    success: (title: string, message?: string) => addToast({ type: 'success', title, message }),
    error:   (title: string, message?: string) => addToast({ type: 'error', title, message }),
    info:    (title: string, message?: string) => addToast({ type: 'info', title, message }),
    warning: (title: string, message?: string) => addToast({ type: 'warning', title, message }),
  }

  // ─── Notifications ────────────────────────────────────────────────────────
  const notifications = ref<Notification[]>([
    {
      id: 'notif-1',
      type: 'success',
      title: 'Dossier prêt',
      message: 'Votre acte de naissance n°BRW-2024-00001 est prêt.',
      isRead: false,
      requestId: 'req-1',
      createdAt: new Date(Date.now() - 3600000).toISOString(),
    },
    {
      id: 'notif-2',
      type: 'info',
      title: 'Document requis',
      message: 'Veuillez fournir votre pièce d\'identité pour la demande BRW-2024-00002.',
      isRead: false,
      requestId: 'req-2',
      createdAt: new Date(Date.now() - 86400000).toISOString(),
    },
  ])

  const unreadCount = computed(() => notifications.value.filter(n => !n.isRead).length)

  function markAsRead(id: string) {
    const n = notifications.value.find(n => n.id === id)
    if (n) n.isRead = true
  }
  function markAllAsRead() { notifications.value.forEach(n => (n.isRead = true)) }

  // ─── Mobile sidebar ───────────────────────────────────────────────────────
  const isMobileMenuOpen = ref(false)
  const toggleMobileMenu = () => (isMobileMenuOpen.value = !isMobileMenuOpen.value)
  const closeMobileMenu  = () => (isMobileMenuOpen.value = false)

  // ─── Modal ────────────────────────────────────────────────────────────────
  const modalOpen = ref(false)
  const modalComponent = ref<string | null>(null)
  const modalProps = ref<Record<string, unknown>>({})

  function openModal(component: string, props?: Record<string, unknown>) {
    modalComponent.value = component
    modalProps.value = props ?? {}
    modalOpen.value = true
  }
  function closeModal() {
    modalOpen.value = false
    modalComponent.value = null
    modalProps.value = {}
  }

  // ─── Confirm dialog (remplace window.confirm) ─────────────────────────────
  interface ConfirmOptions {
    title?: string
    message: string
    confirmLabel?: string
    cancelLabel?: string
    danger?: boolean
  }

  const confirmDialog = ref<(ConfirmOptions & {
    open: boolean
    resolve: ((value: boolean) => void) | null
  }) | null>(null)

  function confirm(opts: ConfirmOptions | string): Promise<boolean> {
    const options: ConfirmOptions = typeof opts === 'string'
      ? { message: opts }
      : opts
    return new Promise((resolve) => {
      confirmDialog.value = {
        open: true,
        title: options.title ?? 'Confirmation',
        message: options.message,
        confirmLabel: options.confirmLabel ?? 'Confirmer',
        cancelLabel: options.cancelLabel ?? 'Annuler',
        danger: options.danger ?? false,
        resolve,
      }
    })
  }

  function resolveConfirm(value: boolean) {
    const current = confirmDialog.value
    if (!current) return
    current.resolve?.(value)
    confirmDialog.value = null
  }

  return {
    toasts, notifications, unreadCount,
    isMobileMenuOpen, modalOpen, modalComponent, modalProps,
    confirmDialog,
    addToast, removeToast, toast,
    markAsRead, markAllAsRead,
    toggleMobileMenu, closeMobileMenu,
    openModal, closeModal,
    confirm, resolveConfirm,
  }
})
