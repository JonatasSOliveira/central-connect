import { Container } from '@/components/molecules/container'
import { NavigationMenuFooter, NavigationMenuFooterProps } from './footer'
import { Header } from './header'

interface NavigationMenuProps extends NavigationMenuFooterProps {
  children: React.ReactNode
}

export const NavigationMenu: React.FC<NavigationMenuProps> = ({
  children,
  ...props
}) => {
  return (
    <div className="flex flex-1 flex-col">
      <Header />
      <div className="flex-1 flex flex-col justify-center items-center py-4">
        <Container>{children}</Container>
      </div>
      <NavigationMenuFooter {...props} />
    </div>
  )
}
