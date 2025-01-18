// import Link from 'next/link'
import { Container } from '@/components/container'
import { SignInForm } from './form'

const HomePage: React.FC = () => {
  return (
    <Container>
      <h1>Central Connect</h1>
      <SignInForm />
      {/* <Link href={pageDefinition.path}>
        <span className="text-blue-500 underline">Novo? Cadastre-se</span>
      </Link> */}
    </Container>
  )
}

export default HomePage
