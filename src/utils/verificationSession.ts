const STORAGE_KEY = 'barua_otp_identifier'
const CREDENTIALS_KEY = 'barua_pending_login_credentials'
const COOKIE_NAME = 'barua_pending_verify'

export interface PendingLoginCredentials {
  email: string
  password: string
}

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

/** Mot de passe conservé le temps du parcours inscription → validation OTP (session uniquement). */
export function persistPendingLoginCredentials(email: string, password: string) {
  try {
    const payload: PendingLoginCredentials = {
      email: email.trim(),
      password,
    }
    sessionStorage.setItem(CREDENTIALS_KEY, JSON.stringify(payload))
  } catch {
    // ignore private mode
  }
}

export function readPendingLoginCredentials(): PendingLoginCredentials | null {
  try {
    const raw = sessionStorage.getItem(CREDENTIALS_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as PendingLoginCredentials
    if (!parsed?.email?.trim() || !parsed.password) return null
    return { email: parsed.email.trim(), password: parsed.password }
  } catch {
    return null
  }
}

export function clearPendingLoginCredentials() {
  try {
    sessionStorage.removeItem(CREDENTIALS_KEY)
  } catch {
    // ignore
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

/** Nettoie e-mail OTP + identifiants temporaires (fin du parcours inscription). */
export function clearPendingRegistrationSession() {
  clearPendingVerification()
  clearPendingLoginCredentials()
}
