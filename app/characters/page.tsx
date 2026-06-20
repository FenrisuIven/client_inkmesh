'use client';

import { redirect, RedirectType } from 'next/navigation'
import {
  useAuth
} from "@/hooks/use-auth";

export default function HandleRedirect () {
  const {isLoading, isAuthenticated, user} = useAuth();

  return <>
    {
      !isLoading ?
        isAuthenticated ? redirect(`/characters/${user?.id}`) : redirect('/dashboard', RedirectType.replace)
      : null
    }
  </>;
}