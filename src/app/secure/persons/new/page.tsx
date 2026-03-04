"use client";

import {
  Button,
  Container,
  Field,
  Fieldset,
  Heading,
  Input,
} from "@chakra-ui/react";

export default function PersonsNewPage() {
  return (
    <Container maxW="sm" py={12}>
      <Heading size="4xl" textAlign="center">
        Nova pessoa
      </Heading>
      <Fieldset.Root size="lg" maxW="md">
        <Fieldset.Content>
          <Field.Root>
            <Field.Label>Nome</Field.Label>
            <Input name="name" />
          </Field.Root>
        </Fieldset.Content>

        <Button type="submit">Salvar</Button>
      </Fieldset.Root>
    </Container>
  );
}
