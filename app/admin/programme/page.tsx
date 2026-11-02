import { getSessions } from '@/lib/data/programme'
import { AdminProgrammePage } from '@/components/admin/programme/AdminProgrammePage'
import { peutEditer, sessionCourante } from '@/lib/auth/droits'

export const metadata = {
  title: 'Programmation - Admin GÉOMTL',
}

export default async function ProgrammePage() {
  const [sessions, { role }] = await Promise.all([getSessions(), sessionCourante()])
  return <AdminProgrammePage sessions={sessions} peutModifier={peutEditer(role)} peutSupprimer={role === 'admin'} />
}
