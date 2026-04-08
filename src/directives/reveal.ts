import type { Directive } from 'vue'

export type RevealVariant = 'up' | 'fade' | 'scale' | 'left' | 'right'

export interface RevealBinding {
  once?: boolean
  delay?: number
  duration?: number
  variant?: RevealVariant
  /** IntersectionObserver rootMargin, e.g. `0px 0px 12% 0px` to start slightly before fully in view */
  margin?: string
  threshold?: number
  /** If set, observe `el` and reveal each matching descendant with staggered delay */
  stagger?: string
  staggerMs?: number
}

type RevealEl = HTMLElement & { __revealObserver?: IntersectionObserver }

/** `querySelectorAll` on an Element rejects leading `>`; `:scope > …` is valid. */
function normalizeStaggerSelector(sel: string): string {
  const s = sel.trim()
  if (s.startsWith('>')) return `:scope ${s}`
  return s
}

function addRevealIn(targets: HTMLElement[]) {
  /* Deux frames : garantit un paint à l’état initial (opacity/transform) avant la transition CSS. */
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      for (const t of targets) t.classList.add('reveal--in')
    })
  })
}

function applyObserver(
  el: RevealEl,
  targets: HTMLElement[],
  once: boolean,
  threshold: number,
  rootMargin: string,
) {
  const obs = new IntersectionObserver(
    entries => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue
        addRevealIn(targets)
        if (once) obs.disconnect()
      }
    },
    { threshold, rootMargin },
  )
  el.__revealObserver = obs
  obs.observe(el)
}

export const vReveal: Directive<RevealEl, RevealBinding | undefined> = {
  mounted(el, binding) {
    const v = binding.value
    const once = v?.once ?? true
    const baseDelay = v?.delay ?? 0
    const variant = v?.variant ?? 'up'
    const duration = v?.duration
    const rootMargin = v?.margin ?? '0px 0px 12% 0px'
    const threshold = v?.threshold ?? 0
    const staggerSel = v?.stagger

    if (staggerSel) {
      const children = Array.from(
        el.querySelectorAll<HTMLElement>(normalizeStaggerSelector(staggerSel)),
      )
      const staggerMs = v?.staggerMs ?? 80
      children.forEach((child, i) => {
        child.classList.add('reveal', `reveal--${variant}`)
        if (duration != null) child.style.setProperty('--reveal-duration', `${duration}ms`)
        child.style.transitionDelay = `${baseDelay + i * staggerMs}ms`
      })
      applyObserver(el, children, once, threshold, rootMargin)
      return
    }

    el.classList.add('reveal', `reveal--${variant}`)
    if (baseDelay) el.style.transitionDelay = `${baseDelay}ms`
    if (duration != null) el.style.setProperty('--reveal-duration', `${duration}ms`)

    applyObserver(el, [el], once, threshold, rootMargin)
  },
  unmounted(el) {
    el.__revealObserver?.disconnect()
    delete el.__revealObserver
  },
}
