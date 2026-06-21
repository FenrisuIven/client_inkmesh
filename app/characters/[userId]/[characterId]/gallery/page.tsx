"use client";

import { RiImageLine } from "@remixicon/react";
import React, { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { API_BASE_URL } from "@/app/lib/types";
import { Button } from "@/components/ui/button";
import Image
  from "next/image";
import {
  Skeleton
} from "@/components/ui/skeleton";

interface CharacterImage {
  id: string;
  url: string;
}

function AuthenticatedImage({ src, alt }: { src: string; alt: string }) {
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
      <div className="min-w-60 max-w-60 h-60 shadow-md rounded-lg">
        <RiImageLine className="size-6 text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="min-w-60 max-w-60 group bg-background overflow-hidden transition-all hover:shadow-md outline-5 outline-white hover:border-border rounded-lg shadow-md flex flex-col h-60">
      <div className="aspect-[1/1] bg-muted flex items-center justify-center overflow-hidden shrink-0 rounded-lg">
        <Image src={blobUrl} alt={alt} className="w-full h-full object-cover" width={240} height={240}/>
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

  const handleImageSubmit = async (e: SubmitEvent) => {
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
        <form onSubmit={handleImageSubmit}>
          <input
            type="file"
            accept="image/png, image/jpeg"
            ref={fileInputRef}
          />
          <Button type="submit">
            Upload Image
          </Button>
        </form>
      </aside>

      <div className="flex-1 overflow-y-auto p-8">
        <div className="flex gap-6 flex-wrap">
          {characterImages.map((image) => (
            <AuthenticatedImage 
              key={image.id} 
              src={`${API_BASE_URL}/characters/${characterId}/images/${image.id}?size=thumbnail`}
              alt="Character" 
            />
          ))}
        </div>
      </div>
  </div>);
}