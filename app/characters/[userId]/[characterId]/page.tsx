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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { RiEditLine, RiDeleteBinLine, RiArrowLeftLine, RiImageLine, RiBookLine, RiCloseLine } from "@remixicon/react";
import Link from "next/link";
import { getProjectsByCharacter, unlinkCharacter } from "@/lib/api";
import {
  Skeleton
} from "@/components/ui/skeleton";

interface Character {
  id: string;
  name: string;
  description: string;
  is_public: boolean;
  owner_auth0_id: string;
}

interface Project {
  id: string;
  name: string;
  description: string | null;
}

export default function CharacterDetailPage() {
  const { userId, characterId } = useParams();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();

  const [character, setCharacter] = useState<Character | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editIsPublic, setEditIsPublic] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);

  const fetchCharacter = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/characters/${characterId}`, {
        credentials: "include",
      });
      if (response.ok) {
        const data = await response.json();
        setCharacter(data);
        setEditName(data.name);
        setEditDescription(data.description);
        setEditIsPublic(data.is_public);
        
        // Fetch projects as well
        const projectsData = await getProjectsByCharacter(characterId as string);
        setProjects(projectsData);
      } else {
        router.push(`/characters/${userId}`);
      }
    } catch (error) {
      console.error("Failed to fetch character:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUnlinkFromProject = async (projectId: string) => {
    if (!confirm('Are you sure you want to remove this character from this project?')) return;
    try {
      await unlinkCharacter(projectId, characterId as string);
      const updated = await getProjectsByCharacter(characterId as string);
      setProjects(updated);
    } catch (err) {
      console.error('Failed to unlink from project:', err);
    }
  };

  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated || (user && user.id !== userId)) {
        router.push("/dashboard");
        return;
      }
      fetchCharacter();
    }
  }, [authLoading, isAuthenticated, user, userId, characterId]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    try {
      const response = await fetch(`${API_BASE_URL}/characters/${characterId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editName,
          description: editDescription,
        }),
        credentials: "include",
      });

      if (response.ok) {
        await fetch(`${API_BASE_URL}/characters/${characterId}/visibility`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ isPublic: editIsPublic }),
          credentials: "include",
        });

        setIsEditOpen(false);
        fetchCharacter();
      }
    } catch (error) {
      console.error("Failed to update character:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this character?")) return;

    alert("Deletion functionality is currently disabled.");
  };

  return (
    <div className="flex h-[calc(100vh-3rem)] overflow-hidden bg-muted/30 pt-4">
      {/* Left Sidebar - Actions */}
      <aside className="w-60 border-r-2 border-b-2 bg-background p-4 flex flex-col gap-4 rounded-2xl shadow-md">
        <div className="mb-4">
           <Button variant="ghost" size="sm" asChild className="gap-2">
              <Link href={`/characters/${userId}`}>
                <RiArrowLeftLine className="size-4" />
                Back to List
              </Link>
           </Button>
        </div>

        <h2 className="text-lg font-semibold px-2 mb-2">Actions</h2>

        {character && <>
          <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
            <DialogTrigger asChild>
              <Button className="w-full justify-start gap-2" variant="outline">
                <RiEditLine className="size-4" />
                Edit Info
              </Button>
            </DialogTrigger>
            <DialogContent>
              <form onSubmit={handleUpdate}>
                <DialogHeader>
                  <DialogTitle>Edit Character</DialogTitle>
                  <DialogDescription>
                    Update character name and biography.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="edit-name">Name</Label>
                    <Input
                      id="edit-name"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="edit-description">Description</Label>
                    <Textarea
                      id="edit-description"
                      value={editDescription}
                      onChange={(e) => setEditDescription(e.target.value)}
                      rows={5}
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="edit-is_public"
                      checked={editIsPublic}
                      onCheckedChange={(checked) => setEditIsPublic(checked as boolean)}
                    />
                    <Label htmlFor="edit-is_public" className="text-sm font-normal">
                      Public (Visible to others)
                    </Label>
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit" disabled={isUpdating}>
                    {isUpdating ? "Saving..." : "Save Changes"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>

          <Button
            className="w-full justify-start gap-2 text-destructive hover:text-destructive hover:bg-destructive/10"
            variant="ghost"
            onClick={handleDelete}
          >
            <RiDeleteBinLine className="size-4" />
            Delete Character
          </Button>
        </>}
      </aside>

      {/* Main Content - Detail Sections */}

      <div className="flex-1 overflow-y-auto p-8">
        <div className="max-w-4xl mx-auto space-y-12">

          {/* Section 1: Avatar & Header */}
          <section className="flex flex-col items-center gap-6">
            {loading || authLoading ? <Skeleton className="w-48 h-48 rounded-full shadow-md border-4 border-background"/> :
              <div className="size-48 rounded-full bg-muted flex items-center justify-center shadow-inner overflow-hidden border-4 border-background shadow-md">
                <span className="text-muted-foreground/20 text-7xl font-bold uppercase">
                  {character?.name.substring(0, 2)}
                </span>
              </div>
            }
            <div className="text-center flex flex-col items-center">
              {loading || authLoading ? <>
                  <Skeleton className="w-2xs h-10 shadow-md"/>
                  <Skeleton className="w-80 h-[26px] shadow-md mt-2 "/>
                </> : <>
                  <h1 className="text-4xl font-black tracking-tight">{character?.name}</h1>
                  <p className="text-muted-foreground mt-2 max-w-lg mx-auto leading-relaxed">
                    {character?.description || "No biography provided yet. Use the Edit button to add one."}
                  </p>
                </>
              }
            </div>
          </section>

          {/* Section 2: Customizable Area (Mock) */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">Details & Attributes</h2>
              <Button variant="ghost" size="sm" disabled className="text-muted-foreground">Customize</Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="h-24 rounded-2xl border-2 border-dashed border-muted flex items-center justify-center text-muted-foreground/50 text-sm">
                Custom attribute placeholder
              </div>
              <div className="h-24 rounded-2xl border-2 border-dashed border-muted flex items-center justify-center text-muted-foreground/50 text-sm">
                Custom attribute placeholder
              </div>
            </div>
          </section>

          {/* Section: Involved Projects (Condensed) */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">Involved Projects</h2>
              <span className="text-sm text-muted-foreground">{projects.length} project(s)</span>
            </div>

            {projects.length === 0 ? (
              <div className="text-sm text-muted-foreground italic bg-muted/20 p-4 rounded-xl border border-dashed text-center">
                This character hasn&apos;t been used in any stories yet.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {projects.map((project) => (
                  <div key={project.id} className="group flex items-center justify-between p-3 rounded-xl border bg-card hover:bg-accent/50 transition-colors">
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 text-primary">
                        <RiBookLine className="size-4" />
                      </div>
                      <div className="truncate">
                        <div className="font-semibold text-sm truncate">{project.name}</div>
                        <div className="text-[10px] text-muted-foreground truncate uppercase tracking-widest font-bold">Project</div>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-8 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => handleUnlinkFromProject(project.id)}
                    >
                      <RiCloseLine className="size-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Section 3: Gallery (Mock) */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">Image Gallery</h2>
              <span className="text-sm text-muted-foreground">Limit: 100 images</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="aspect-square rounded-xl bg-muted/50 border flex flex-col items-center justify-center gap-2 group hover:bg-muted transition-colors cursor-pointer">
                  <RiImageLine className="size-6 text-muted-foreground/30 group-hover:text-muted-foreground/50" />
                  <span className="text-[10px] text-muted-foreground/40 font-medium">IMAGE_00{i}.JPG</span>
                </div>
              ))}
            </div>

            <div className="flex justify-center pt-2">
              <Button variant="outline" size="sm" className="rounded-full px-8">
                <Link href={`/characters/${userId}/${characterId}/gallery`}>
                  View All & Upload
                </Link>
              </Button>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}
