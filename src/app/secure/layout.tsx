import { NavigationMenu } from '@/components/organisms/navigation-menu'
import { churchPageDefinition } from './church/page-definition'
import { dashboardPageDefinition } from './dashboard/page-definition'
import { ChurchProvider } from '@/context/ChurchContext'
import { personsPageDefinition } from './person/page-definition'
import { churchRolePageDefinition } from './church-role/page-definition'
import { PageNavigationOption } from '@/components/organisms/navigation-menu/footer'
import { weeklyConfigPageDefinition } from './weekly-config/page-definition'

const pages: PageNavigationOption[] = [
  { definition: dashboardPageDefinition },
  { definition: churchPageDefinition },
  {
    definition: churchRolePageDefinition,
    onlyShowIfHaveChurch: true,
  },
  {
    definition: personsPageDefinition,
    onlyShowIfHaveChurch: true,
  },
  {
    definition: weeklyConfigPageDefinition,
    onlyShowIfHaveChurch: true,
  },
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
