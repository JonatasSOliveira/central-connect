import { createSelfSignupInfrastructure } from "@/modules/self-signup/infrastructure/composition/self-signup-infrastructure";
import { createSelfSignupHandlers } from "@/modules/self-signup/presentation/http/handlers/self-signup-handlers";

export function createSelfSignupComposition() {
  const infrastructure = createSelfSignupInfrastructure();

  return {
    useCases: infrastructure,
    httpHandlers: createSelfSignupHandlers(infrastructure),
  };
}

export type SelfSignupComposition = ReturnType<
  typeof createSelfSignupComposition
>;
