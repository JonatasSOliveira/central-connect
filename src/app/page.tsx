"use client";

import { useAsyncLoading } from "@/hooks/asyncLoading.hook";
import { AuthApiClient } from "@/infra/api/AuthApiClient";
import { signInWithGoogle } from "@/infra/firebase/client";
import { AbsoluteCenter, Button, Fieldset, Stack } from "@chakra-ui/react";
import { useRouter } from "next/navigation";

const api = new AuthApiClient();

export default function LoginPage() {
  const { run } = useAsyncLoading();
  const router = useRouter();

  const handleLoginWithGoogle = () =>
    run(async () => {
      const { user } = await signInWithGoogle();
      const idToken = await user.getIdToken();
      const signinResult = await api.signin({ token: idToken });

      if (!signinResult.isSuccess) {
        return;
      }

      router.replace("/secure/home");
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
