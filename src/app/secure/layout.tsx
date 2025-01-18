import { NavigationMenu } from '@/components/navigation-menu'

export default function SecureLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return <NavigationMenu>{children}</NavigationMenu>
}
