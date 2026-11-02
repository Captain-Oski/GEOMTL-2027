import { SessionForm } from '@/components/admin/programme/SessionForm'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { peutEditer, sessionCourante } from '@/lib/auth/droits'

export const metadata = {
  title: 'Nouvelle session - Admin GÉOMTL',
}

export default async function NewSessionPage() {
  const { role } = await sessionCourante()
  if (!peutEditer(role)) redirect('/admin/programme')

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-6">
        <Link href="/admin/programme" className="text-xs text-gray-500 hover:text-white transition-colors">
          ← Retour à la programmation
        </Link>
        <h1 className="text-2xl font-bold text-white mt-2">Nouvelle session</h1>
      </div>
      <SessionForm />
    </div>
  )
}
