import type { Metadata } from 'next'
import { getAdminUser } from '@/lib/supabase/server'
import AdminLogin from '@/components/admin-login'
import AdminBookings from '@/components/admin-bookings'

// Hidden panel: never linked from the public site, never indexed.
export const metadata: Metadata = {
  title: 'Admin — GlossnGrace',
  robots: { index: false, follow: false },
}

export default async function AdminPage() {
  const admin = await getAdminUser()

  if (!admin) {
    return (
      <main className="min-h-screen bg-[#fff8f6] flex items-center justify-center px-4">
        <AdminLogin />
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#fff8f6] px-4 py-8">
      <AdminBookings email={admin.email ?? ''} />
    </main>
  )
}
