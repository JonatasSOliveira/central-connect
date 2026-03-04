import NextLink from "next/link";
import { Button, Container, Heading, Link, Stack } from "@chakra-ui/react";

export default function HomePage() {
  return (
    <Container maxW="sm" py={12}>
      <Stack gap={6} align="stretch">
        <Heading size="4xl" textAlign="center">
          Home
        </Heading>

        <Link asChild>
          <NextLink href="/secure/persons">
            <Button size="lg" width="100%">
              Pessoas
            </Button>
          </NextLink>
        </Link>
      </Stack>
    </Container>
  );
}
