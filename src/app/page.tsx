// import Link from 'next/link'
import { Container } from '@/components/molecules/container'
import { SignInForm } from './form'
import { H1 } from '@/components/atoms/h1'

const HomePage: React.FC = () => {
  return (
    <Container fullScreen={false}>
      <H1>Central Connect</H1>
      <SignInForm />
    </Container>
  )
}

export default HomePage
