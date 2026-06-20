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
import {
  Skeleton
} from "@/components/ui/skeleton";
import {
  cn
} from "@/lib/utils";
import {
  usePathname
} from "next/navigation";

export const Header = () => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const pathname = usePathname();

  return (
    <header className={cn(
      "flex h-12 w-full shrink-0 items-center gap-2 border-b-2 rounded-lg px-4 justify-between z-1 border-neutral-200/50 shadow-md",
      pathname == "/" ? "bg-white/40 backdrop-blur-sm" : "bg-white"
    )}>
      <div>
        <Link href="/" className="font-semibold">
          Inkmesh
        </Link>
      </div>

      <div className="flex gap-2 items-center">
        {isLoading ? <>
          <Skeleton className="relative h-8 w-8 rounded-full"/>
        </> : (
          <>
            {isAuthenticated && user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar size="sm">
                      <AvatarImage src={`https://avatar.vercel.sh/${user.username}.png`} alt={user.username} />
                      <AvatarFallback asChild>
                        <Skeleton className="relative h-8 w-8 rounded-full"/>
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-full">
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user.username}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard">Projects</Link>
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
                <Button variant="outline" asChild size="sm" className="shadow-sm">
                  <a href={`${API_BASE_URL}/auth/login`}>Log In</a>
                </Button>
                <Button asChild size="sm" className="shadow-sm border-0">
                  <a href={`${API_BASE_URL}/auth/login?scope=register`}>Sign Up</a>
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </header>
  );
};