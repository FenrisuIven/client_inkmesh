'use client';

import { BackgroundGradient } from "@/components/ui/gradient";
import {
  Card,
  CardContent
} from "@/components/ui/card";
import {
  Button
} from "@/components/ui/button";
import {
  API_BASE_URL
} from "@/app/lib/types";

export default function Home() {
  return (
    <BackgroundGradient opacity={0.2}>
      <div className="flex flex-col items-center justify-center h-screen font-[family-name:var(--font-sans)] pt-16">
        <Card className="w-[75%] h-[75%] ring-0 bg-transparent shadow-none">
          <CardContent className="grid grid-cols-[4fr_3fr] gap-16 h-full">
            <div className="h-full flex flex-col justify-center">
              <h1 className="scroll-m-20 text-5xl font-medium tracking-tight text-balance pb-8">
                Weave Worlds Together with <span className="font-extrabold">Inkmesh</span>.
              </h1>
              <p className="text-xl">
                The all-in-one collaborative fiction platform designed for storytellers. Co-write documents in real-time, build rich character galleries, and keep your entire universe organized in one place.
              </p>
            </div>
            <div className="h-full flex flex-col justify-center gap-4">
              <Button size="lg" className="text-lg py-6 shadow-sm border-0" asChild>
                <a href={`${API_BASE_URL}/auth/login?redirect=dashboard`}>Manage Projects</a>
              </Button>
              <Button size="lg" className="text-lg py-6 shadow-sm border-0" asChild>
                <a href={`${API_BASE_URL}/auth/login?redirect=characters`}>Browse Characters</a>
              </Button>
              <Button size="lg" className="text-lg py-6 bg-white/75 backdrop-blur-md shadow-sm" variant="outline">
                <a href={`${API_BASE_URL}/auth/login?scope=register`}>Sign up to Inkmesh</a>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </BackgroundGradient>
  );
}
