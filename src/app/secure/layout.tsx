import { NavigationMenu } from '@/components/organisms/navigation-menu'
import { churchPageDefinition } from './church/page-definition'
import { dashboardPageDefinition } from './dashboard/page-definition'
import { PageDefinition } from '@/types/page-definition'

const pages: PageDefinition[] = [churchPageDefinition, dashboardPageDefinition]

export default function SecureLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return <NavigationMenu pages={pages}>{children}</NavigationMenu>
}
