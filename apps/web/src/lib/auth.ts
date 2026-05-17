import { cookies } from 'next/headers'

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

export type AuthUser = { id: string; email: string; name: string | null }

export async function getUser(): Promise<AuthUser | null> {
  try {
    const cookieStore = await cookies()
    const session = cookieStore.get('ffp_session')
    if (!session?.value) return null

    const res = await fetch(`${API}/api/auth/me`, {
      headers: { Cookie: `ffp_session=${session.value}` },
      cache: 'no-store',
    })
    if (!res.ok) return null
    const data = await res.json()
    return data.result?.user ?? null
  } catch {
    return null
  }
}
