"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { API_BASE_URL } from "@/app/lib/types";
import { useAuth } from "@/hooks/use-auth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export const Header = () => {
  const { user, isAuthenticated, isLoading } = useAuth();

  return (
    <header className="flex h-12 w-full shrink-0 items-center gap-2 border-b-2 rounded-4xl px-4 justify-between z-1 bg-neutral-50/50 border-neutral-200/50">
      <div>
        <Link href="/dashboard" className="font-semibold">
          InkMesh
        </Link>
      </div>

      <div className="flex gap-2 items-center">
        {!isLoading && (
          <>
            {isAuthenticated && user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar size="sm">
                      <AvatarImage src={`https://avatar.vercel.sh/${user.username}.png`} alt={user.username} />
                      <AvatarFallback>{user.username.substring(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user.username}</p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user.auth0Id}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard">Dashboard</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href={`/characters/${user.id}`}>Characters</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild className="text-destructive focus:text-destructive">
                    <a href={`${API_BASE_URL}/auth/logout`}>Log out</a>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex gap-2">
                <Button variant="secondary" asChild size="sm">
                  <a href={`${API_BASE_URL}/auth/login`}>Log In</a>
                </Button>
                <Button asChild size="sm">
                  <a href={`${API_BASE_URL}/auth/login`}>Sign Up</a>
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </header>
  );
};