import {
  Button
} from "@/components/ui/button";
import Link from "next/link";
import { API_BASE_URL } from "@/app/lib/types";

export const Header = () => {
  return (
    <header className="flex h-12 w-full shrink-0 items-center gap-2 border-b px-4 justify-between">
      <div>
        <Link href="dashboard">
          Dashboard
        </Link>
      </div>
      <div></div>
      <div className="flex gap-2">
        <Button variant="secondary" asChild>
          <a href={`${API_BASE_URL}/auth/login`}>Log In</a>
        </Button>
        <Button asChild>
          <a href={`${API_BASE_URL}/auth/login`}>Sign Up</a>
        </Button>
      </div>
    </header>
  )
}