import NextLink from "next/link";
import { Button, Container, Heading, Link, Stack } from "@chakra-ui/react";

export default function PersonsPage() {
  return (
    <Container maxW="sm" py={12}>
      <Stack gap={6} align="stretch">
        <Heading size="4xl" textAlign="center">
          Pessoas
        </Heading>

        <Link asChild>
          <NextLink href="/secure/persons/new">
            <Button size="lg" width="100%">
              Novo registro
            </Button>
          </NextLink>
        </Link>
      </Stack>
    </Container>
  );
}
