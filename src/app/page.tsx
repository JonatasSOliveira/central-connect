// import Link from 'next/link'
import { Container } from '@/components/molecules/container'
import { SignInForm } from './form'

const HomePage: React.FC = () => {
  return (
    <Container fullScreen={false}>
      <h1>Central Connect</h1>
      <SignInForm />
    </Container>
  )
}

export default HomePage
