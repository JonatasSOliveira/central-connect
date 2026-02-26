"use client";

import {
  SignInWithGoogleInputDTO,
  SignInWithGoogleInputSchema,
} from "@/application/dtos/auth/SignInWithGoogle.input.dto";
import { useAsyncLoading } from "@/hooks/asyncLoading.hook";
import { AuthApiClient } from "@/infra/api/AuthApiClient";
import { signInWithGoogle } from "@/infra/firebase/client";
import { AbsoluteCenter, Button, Fieldset, Stack } from "@chakra-ui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import { useForm } from "react-hook-form";

const api = new AuthApiClient();

export default function LoginPage() {
  const { run } = useAsyncLoading();

  const handleLoginWithGoogle = () =>
    run(async () => {
      const result = await signInWithGoogle();
      const idToken = await result.user.getIdToken();
      api.signin({ token: idToken });
    });

  return (
    <div>
      <AbsoluteCenter>
        <Fieldset.Root>
          <Stack>
            <Fieldset.Legend>Login</Fieldset.Legend>
          </Stack>

          <Button type="submit" onClick={handleLoginWithGoogle}>
            Acessar com o Google
          </Button>
        </Fieldset.Root>
      </AbsoluteCenter>
    </div>
  );
}
