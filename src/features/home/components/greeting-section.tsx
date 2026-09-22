"use client";

import Image from "next/image";
import { getInitials, getTimeOfDayGreeting } from "../hooks/useHomeScreen";

interface GreetingSectionProps {
  userName: string;
  avatarUrl: string | null;
}

export function GreetingSection({ userName, avatarUrl }: GreetingSectionProps) {
  const greeting = getTimeOfDayGreeting();

  return (
    <div className="flex items-center gap-4 py-4 mb-2">
      <div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center overflow-hidden shrink-0">
        {avatarUrl ? (
          <Image
            loader={({ src }) => src}
            src={avatarUrl}
            alt={userName}
            width={56}
            height={56}
            unoptimized
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="text-primary-foreground text-lg font-bold">
            {getInitials(userName)}
          </span>
        )}
      </div>

      <div className="min-w-0">
        <p className="text-sm text-muted-foreground">{greeting}</p>
        <h2 className="font-heading text-xl font-bold text-foreground truncate">
          {userName}
        </h2>
        <p className="text-xs text-muted-foreground mt-0.5">
          O que você gostaria de fazer hoje?
        </p>
      </div>
    </div>
  );
}
