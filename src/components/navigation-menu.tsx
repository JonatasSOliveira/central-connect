import { Container } from './container'

interface NavigationMenuProps {
  children: React.ReactNode
}

const Header = () => (
  <div className=" bg-white py-2 px-4">
    <h1>Central Connect</h1>
  </div>
)

export const NavigationMenu: React.FC<NavigationMenuProps> = ({ children }) => (
  <div className="flex flex-1 flex-col">
    <Header />
    <div className="flex-1 flex flex-col justify-center items-center">
      <Container>{children}</Container>
    </div>
  </div>
)
