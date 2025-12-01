import { redirect } from 'next/navigation'

export default async function Home() {
  // TODO: Implement authentication check with Prisma
  // For now, redirect to login
  redirect('/login')
}
