"use client";

import { RiImageLine, RiDownload2Line, RiUpload2Line } from "@remixicon/react";
import React, { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { API_BASE_URL } from "@/app/lib/types";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { Skeleton } from "@/components/ui/skeleton";

interface CharacterImage {
  id: string;
  url: string;
}

function AuthenticatedImage({ src, alt, fullSrc }: { src: string; alt: string; fullSrc: string }) {
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(src, { credentials: "include" })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch image");
        return res.blob();
      })
      .then((blob) => {
        setBlobUrl(URL.createObjectURL(blob));
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [src]);

  if (loading) {
    return (
      <Skeleton className="min-w-60 max-w-60 h-60 shadow-md rounded-lg" />
    );
  }
  if (!blobUrl) {
    return (
      <div className="min-w-60 max-w-60 h-60 shadow-md rounded-lg flex items-center justify-center bg-muted">
        <RiImageLine className="size-6 text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="min-w-60 max-w-60 group bg-background overflow-hidden transition-all hover:shadow-md outline-5 outline-white hover:border-border rounded-lg shadow-md flex flex-col h-72">
      <div className="aspect-[1/1] bg-muted flex items-center justify-center overflow-hidden shrink-0 rounded-t-lg">
        <Image src={blobUrl} alt={alt} className="w-full h-full object-cover" width={240} height={240}/>
      </div>
      <div className="p-2 flex justify-end">
        <Button variant="ghost" size="icon" asChild>
          <a href={fullSrc} target="_blank" rel="noopener noreferrer" download>
            <RiDownload2Line className="size-4" />
          </a>
        </Button>
      </div>
    </div>
  );
}

export default function GalleryPage() {
  const { userId, characterId } = useParams();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();

  const [characterImages, setCharacterImages] = useState<CharacterImage[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchCharacterImages = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/characters/${characterId}/images`, {
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        setCharacterImages(data);
      }
    } catch (error) {
      console.error("Failed to fetch character images:", error);
    }
  };

  const handleImageSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const files = fileInputRef.current?.files;
    if (!files || files.length == 0) return;

    const selectedFile = files[0];

    const formData = new FormData();
    formData.append("file", selectedFile);

    const response = await fetch(`${API_BASE_URL}/characters/${characterId}/images`, {
      credentials: "include",
      method: 'POST',
      body: formData
    });

    if (response.ok) {
      fetchCharacterImages();
    }
  }

  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated || (user && user.id !== userId)) {
        router.push("/dashboard");
        return;
      }
      fetchCharacterImages();
    }
  }, [authLoading, isAuthenticated, user, userId, characterId]);

  return (
    <div className="flex h-[calc(100vh-3rem)] overflow-hidden bg-muted/30 pt-4">
      <aside className="w-60 border-r-2 border-b-2 bg-background p-4 flex flex-col gap-4 rounded-2xl shadow-md">
        <h2 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">Upload</h2>
        <form onSubmit={handleImageSubmit} className="flex flex-col gap-2">
          <input
            type="file"
            accept="image/png, image/jpeg"
            ref={fileInputRef}
            className="text-xs file:mr-2 file:py-1 file:px-2 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
          />
          <Button type="submit" className="w-full gap-2">
            <RiUpload2Line className="size-4" />
            Upload
          </Button>
        </form>
      </aside>

      <div className="flex-1 overflow-y-auto p-8">
        <div className="flex gap-6 flex-wrap">
          {characterImages.map((image) => (
            <AuthenticatedImage 
              key={image.id} 
              src={`${API_BASE_URL}/characters/${characterId}/images/${image.id}?size=thumbnail`}
              fullSrc={`${API_BASE_URL}/characters/${characterId}/images/${image.id}`}
              alt="Character" 
            />
          ))}
        </div>
      </div>
  </div>);
}