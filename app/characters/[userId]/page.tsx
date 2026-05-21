"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { API_BASE_URL } from "@/app/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { RiAddLine, RiFilterLine, RiUserAddLine } from "@remixicon/react";
import Link from "next/link";

interface Character {
  id: string;
  name: string;
  description: string;
  is_public: boolean;
  owner_auth0_id: string;
}

export default function CharactersPage() {
  const { userId } = useParams();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();

  const [characters, setCharacters] = useState<Character[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const [newName, setNewName] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newIsPublic, setNewIsPublic] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchCharacters = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/characters/me`, {
        credentials: "include",
      });
      if (response.ok) {
        const data = await response.json();
        setCharacters(data);
      }
    } catch (error) {
      console.error("Failed to fetch characters:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated || (user && user.id !== userId)) {
        router.push("/dashboard");
        return;
      }
      fetchCharacters();
    }
  }, [authLoading, isAuthenticated, user, userId]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const response = await fetch(`${API_BASE_URL}/characters`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newName,
          description: newDescription,
          isPublic: newIsPublic,
        }),
        credentials: "include",
      });

      if (response.ok) {
        setIsCreateOpen(false);
        setNewName("");
        setNewDescription("");
        setNewIsPublic(true);
        fetchCharacters();
      }
    } catch (error) {
      console.error("Failed to create character:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (authLoading || loading) {
    return <div className="flex items-center justify-center h-full p-20">Loading...</div>;
  }

  return (
    <div className="flex h-[calc(100vh-3rem)] overflow-hidden bg-muted/30">
      {/* Left Sidebar - Actions */}
      <aside className="w-64 border-r bg-background p-4 flex flex-col gap-4">
        <h2 className="text-lg font-semibold px-2 mb-2">Actions</h2>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="w-full justify-start gap-2" variant="outline">
              <RiUserAddLine className="size-4" />
              New Character
            </Button>
          </DialogTrigger>
          <DialogContent>
            <form onSubmit={handleCreate}>
              <DialogHeader>
                <DialogTitle>Create Character</DialogTitle>
                <DialogDescription>
                  Add a new character to your global library.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="Character name"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={newDescription}
                    onChange={(e) => setNewDescription(e.target.value)}
                    placeholder="Brief bio or description"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="is_public"
                    checked={newIsPublic}
                    onCheckedChange={(checked) => setNewIsPublic(checked as boolean)}
                  />
                  <Label htmlFor="is_public" className="text-sm font-normal">
                    Public (Visible to others)
                  </Label>
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Creating..." : "Create Character"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
        
        <Button className="w-full justify-start gap-2" variant="ghost" disabled>
          <RiFilterLine className="size-4" />
          Bulk Manage
        </Button>
      </aside>

      {/* Main Content - Character Grid */}
      <main className="flex-1 overflow-y-auto p-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Characters</h1>
            <span className="text-sm text-muted-foreground">{characters.length} characters</span>
          </div>

          {characters.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed rounded-xl text-muted-foreground">
              <p>You haven't created any characters yet.</p>
              <Button variant="link" onClick={() => setIsCreateOpen(true)}>Create your first one</Button>
            </div>
          ) : (
            <div className="grid grid-cols-[repeat(auto-fill,minmax(180px,220px))] gap-6">
              {characters.map((char) => (
                <Link key={char.id} href={`/characters/${userId}/${char.id}`} className="block w-full max-w-55 mx-auto sm:mx-0">
                  <div className="group bg-background overflow-hidden transition-all hover:shadow-md border border-transparent hover:border-border rounded-lg shadow-sm flex flex-col h-60">
                    {/* Polaroid Top - Image Mock */}
                    <div className="aspect-[4/3] bg-muted flex items-center justify-center overflow-hidden shrink-0">
                       <span className="text-muted-foreground/30 text-3xl font-bold uppercase">
                          {char.name.substring(0, 2)}
                       </span>
                    </div>
                    {/* Polaroid Bottom - Info */}
                    <div className="p-4 bg-white flex-1 flex flex-col min-h-0">
                      <h3 className="font-semibold text-base truncate">{char.name}</h3>
                      <p className="text-xs text-muted-foreground line-clamp-6 mt-2 overflow-hidden leading-relaxed">
                        {char.description || "No description provided yet."}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Right Sidebar - Mock Filters */}
      <aside className="w-64 border-l bg-background p-4 flex flex-col gap-6">
        <div>
          <h2 className="text-lg font-semibold px-2 mb-4">Filters</h2>
          <div className="space-y-4 px-2">
            <div className="grid gap-2 opacity-50">
              <Label className="text-xs uppercase text-muted-foreground font-bold">Grid Size</Label>
              <Input disabled placeholder="Default" />
            </div>
            <div className="grid gap-2 opacity-50">
              <Label className="text-xs uppercase text-muted-foreground font-bold">Amount to display</Label>
              <Input disabled placeholder="20 per page" />
            </div>
          </div>
        </div>

        <div className="mt-auto p-4 bg-muted/50 rounded-xl text-xs text-muted-foreground italic">
          Tip: You can link these characters to specific projects from the project settings.
        </div>
      </aside>
    </div>
  );
}
