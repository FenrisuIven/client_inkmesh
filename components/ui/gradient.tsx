"use client"

import type React from "react"
import { cn } from "@/lib/utils"
import { Shader } from "react-shaders"

const blobShader = `
// Helper function to calculate the influence of a single metaball
float metaball(vec2 uv, vec2 pos, float radius) {
    vec2 d = uv - pos;
    // Inverse square distance creates the magnetic "snapping" effect
    return (radius * radius) / dot(d, d);
}

void mainImage( out vec4 fragColor, in vec2 fragCoord )
{
    // Normalize coordinates to the center and correct the aspect ratio
    vec2 uv = (fragCoord - 0.5 * iResolution.xy) / iResolution.y;

    // Apply the speed control uniform
    float time = iTime * u_speed;

    // Base time modifier for movement
    float t = time * u_frequency;

    // UPDATED: Tighter trajectories and forced opposing directions.
    // 1. Reduced the multipliers outside the sine/cosine (e.g., 0.8, 0.4) to keep them closer to the center.
    // 2. Added negative signs (-) to force blobs to move against each other.
    // 3. Added phase shifts (+ 1.5, + 3.0) to desynchronize their starting positions.
    
    vec2 p1 = vec2(
        sin(t * 0.34 + 0.0) * 0.8 + cos(t * 0.21 + 1.5) * 0.3,
        cos(t * 0.28 + 0.0) * 0.5 + sin(t * 0.15 + 2.0) * 0.2
    );
    
    // Blob 2 moves in the opposite X direction (-0.8)
    vec2 p2 = vec2(
        cos(t * 0.29 + 2.4) * -0.8 + sin(t * 0.18 + 0.5) * 0.4,
        sin(t * 0.33 + 1.1) * -0.5 + cos(t * 0.22 + 3.0) * 0.3
    );
    
    // Blob 3 sweeps with negative Y to cross paths with Blob 1
    vec2 p3 = vec2(
        sin(t * 0.41 + 4.2) * 0.7 - cos(t * 0.25 + 1.2) * 0.4,
        cos(t * 0.19 + 3.5) * 0.6 - sin(t * 0.31 + 0.8) * 0.3
    );
    
    // Blob 4 uses aggressive offsets to cut across the middle
    vec2 p4 = vec2(
        cos(t * 0.22 + 6.1) * -0.7 - cos(t * 0.37 + 2.2) * 0.3,
        sin(t * 0.27 + 1.9) * 0.5 + sin(t * 0.14 + 6.4) * 0.4
    );

    // Sum the influences of all metaballs on the current pixel
    float field = 0.0;
    
    field += metaball(uv, p1, 0.25); 
    field += metaball(uv, p2, 0.30);
    field += metaball(uv, p3, 0.10);
    field += metaball(uv, p4, 0.18);

    // Create the "blobbing" threshold effect using smoothstep
    float blobMask = smoothstep(0.4, 0.7, field);

    // Create a dynamic color palette for the blobs
    vec3 color1 = vec3(0.2, 0.4, 1.0);  // Blue
    vec3 color2 = vec3(0.8, 0.2, 0.8);  // Purple
    vec3 color3 = vec3(0.0, 1.0, 0.8);  // Cyan

    // Color shifting
    vec3 gradientColor = mix(color1, color2, sin(uv.x * 2.0 + time * 0.5) * 0.5 + 0.5);
    gradientColor = mix(gradientColor, color3, cos(uv.y * 2.0 - time * 0.5) * 0.5 + 0.5);

    // Apply the vibrancy uniform
    vec3 desaturated = vec3(dot(gradientColor, vec3(0.299, 0.587, 0.114)));
    gradientColor = mix(desaturated, gradientColor, u_vibrancy);

    // Apply the intensity uniform
    gradientColor *= u_intensity;

    // Set a background color (very dark blue/black)
    vec3 bgColor = vec3(0.9243, 0.9920, 0.9602);

    // Combine the background and the blobs using the mask we created
    vec3 finalColor = mix(bgColor, gradientColor, blobMask);

    // Add a subtle ambient glow around the blobs
    float glow = clamp(field * 0.15, 0.0, 0.1);
    finalColor += gradientColor * glow * 0.5;

    // Output final color
    fragColor = vec4(finalColor, 1.0);
}
`;

export interface BackgroundGradientProps {
  className?: string
  children?: React.ReactNode,
  speed?: number,
  intensity?: number,
  vibrancy?: number,
  frequency?: number,
  stretch?: number,
  opacity?: number,
}

export const BackgroundGradient = ({
  className,
  children,
  speed = 1.0,
  intensity = 1.0,
  vibrancy = 1.0,
  frequency = 1.0,
  opacity = 1.0
}: BackgroundGradientProps) => {
  return (
    <div className={cn("fixed inset-0 overflow-hidden bg-teal-50", className)}>

      <Shader
        fs={blobShader}
        style={{ width: "100%", height: "100%", opacity: `${opacity}` } as CSSStyleDeclaration}
        uniforms={{
          u_speed: { type: "1f", value: speed },
          u_intensity: { type: "1f", value: intensity },
          u_vibrancy: { type: "1f", value: vibrancy },
          u_frequency: { type: "1f", value: frequency },
        }}
      />

      {/* Subtle noise overlay for texture */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='5' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Content layer */}
      {children && <div className="absolute inset-0 z-10 h-full w-full">{children}</div>}
    </div>
  )
}

export type { BackgroundGradientProps as BackgroundGradientPropsType }
