'use server'

import { AuthDTO } from '@/domain/dtos/auth/auth'
import { AuthenticatedUserDTO } from '@/domain/dtos/auth/authenticated_user'
import { ServiceFacade } from '@/application/service-facade'
import { SignUpRequestDTO } from '@/domain/dtos/auth/sign-up.request'

export async function signIn(authData: AuthDTO): Promise<AuthenticatedUserDTO> {
  return await ServiceFacade.getAuth().signIn(authData)
}

export async function signUp(
  signUpData: SignUpRequestDTO,
): Promise<AuthenticatedUserDTO> {
  return await ServiceFacade.getAuth().signUp(signUpData)
}
