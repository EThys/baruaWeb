import { computed, ref, toValue, watch, type MaybeRefOrGetter } from 'vue'

export const PAGE_SIZE_OPTIONS = [10, 20, 50] as const

export interface UsePaginationOptions {
  pageSize?: number
  /** When this value changes (search, filters…), page resets to 1. */
  resetOn?: MaybeRefOrGetter<unknown>
}

export function usePagination<T>(
  source: MaybeRefOrGetter<readonly T[]>,
  options: UsePaginationOptions = {},
) {
  const page = ref(1)
  const pageSize = ref(options.pageSize ?? 10)

  const items = computed(() => toValue(source) ?? [])
  const total = computed(() => items.value.length)
  const totalPages = computed(() => Math.max(1, Math.ceil(total.value / pageSize.value) || 1))

  const from = computed(() => {
    if (!total.value) return 0
    return (page.value - 1) * pageSize.value + 1
  })
  const to = computed(() => Math.min(page.value * pageSize.value, total.value))

  const pageItems = computed(() => {
    const start = (page.value - 1) * pageSize.value
    return items.value.slice(start, start + pageSize.value)
  })

  function clampPage() {
    if (page.value > totalPages.value) page.value = totalPages.value
    if (page.value < 1) page.value = 1
  }

  watch(totalPages, clampPage)
  watch(pageSize, () => {
    page.value = 1
  })

  if (options.resetOn !== undefined) {
    watch(() => toValue(options.resetOn!), () => {
      page.value = 1
    })
  }

  function setPage(n: number) {
    page.value = Math.min(Math.max(1, n), totalPages.value)
  }

  return {
    page,
    pageSize,
    total,
    totalPages,
    from,
    to,
    pageItems,
    setPage,
  }
}
