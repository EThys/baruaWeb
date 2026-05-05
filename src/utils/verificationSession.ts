const STORAGE_KEY = 'barua_otp_identifier'
const COOKIE_NAME = 'barua_pending_verify'

/** Session navigateur : pas de httpOnly (le backend ne set pas de cookie ici). */
export function persistPendingVerification(email: string) {
  try {
    sessionStorage.setItem(STORAGE_KEY, email.trim())
  } catch {
    // ignore private mode
  }
  const maxAge = 30 * 60
  document.cookie = `${COOKIE_NAME}=${encodeURIComponent(email.trim())};path=/;max-age=${maxAge};SameSite=Lax`
}

export function readPendingVerification(): string | null {
  try {
    const s = sessionStorage.getItem(STORAGE_KEY)
    if (s?.trim()) return s.trim()
  } catch {
    // ignore
  }
  return readCookie(COOKIE_NAME)
}

function readCookie(name: string): string | null {
  if (typeof document === 'undefined') return null
  const m = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`))
  if (!m?.[1]) return null
  try {
    return decodeURIComponent(m[1]).trim() || null
  } catch {
    return m[1].trim() || null
  }
}

export function clearPendingVerification() {
  try {
    sessionStorage.removeItem(STORAGE_KEY)
  } catch {
    // ignore
  }
  document.cookie = `${COOKIE_NAME}=;path=/;max-age=0`
}
