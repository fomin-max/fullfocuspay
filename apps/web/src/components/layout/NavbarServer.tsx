import { getUser } from '@/lib/auth'
import { Navbar } from './Navbar'

export async function NavbarServer() {
  const user = await getUser()
  return <Navbar user={user} />
}
