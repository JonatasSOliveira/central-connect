import { Container } from '../../molecules/container'
import { NavigationMenuFooter, NavigationMenuFooterProps } from './footer'

interface NavigationMenuProps extends NavigationMenuFooterProps {
  children: React.ReactNode
}

const Header = () => (
  <div className=" bg-white py-2 px-4 flex justify-center">
    <span className="font-bold">Central Connect</span>
  </div>
)

export const NavigationMenu: React.FC<NavigationMenuProps> = ({
  pages,
  children,
}) => {
  return (
    <div className="flex flex-1 flex-col">
      <Header />
      <div className="flex-1 flex flex-col justify-center items-center py-4">
        <Container>{children}</Container>
      </div>
      <NavigationMenuFooter pages={pages} />
    </div>
  )
}
