import { NavigationMenu } from '@/components/organisms/navigation-menu'
import { churchPageDefinition } from './church/page-definition'
import { dashboardPageDefinition } from './dashboard/page-definition'
import { PageDefinition } from '@/types/page-definition'
import { ChurchProvider } from '@/context/ChurchContext'
import { personsPageDefinition } from './person/page-definition'
import { churchRolePageDefinition } from './church-role/page-definition'

const pages: PageDefinition[] = [
  dashboardPageDefinition,
  personsPageDefinition,
  churchRolePageDefinition,
  churchPageDefinition,
]

export default function SecureLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <ChurchProvider>
      <NavigationMenu pages={pages}>{children}</NavigationMenu>
    </ChurchProvider>
  )
}
