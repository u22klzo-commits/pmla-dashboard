'use server'

import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'

const SEARCH_ID_COOKIE = 'selected_search_id'

export async function getSelectedSearchId() {
    const cookieStore = await cookies()
    return cookieStore.get(SEARCH_ID_COOKIE)?.value || null
}

export async function setSelectedSearchId(id: string | null) {
    const cookieStore = await cookies()
    if (id) {
        cookieStore.set(SEARCH_ID_COOKIE, id, {
            path: '/',
            maxAge: 60 * 60 * 24 * 7, // 1 week
            httpOnly: true,
            sameSite: 'lax',
        })
    } else {
        cookieStore.delete(SEARCH_ID_COOKIE)
    }
    revalidatePath('/dashboard', 'layout')
    return { success: true }
}
