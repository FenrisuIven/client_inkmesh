"use client"

import type React from "react"
import { forwardRef } from "react"
import { Shader } from "react-shaders"
import { cn } from "@/lib/utils"

export interface AuroraShadersProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Aurora wave speed
   * @default 1.0
   */
  speed?: number

  /**
   * Light intensity and brightness
   * @default 1.0
   */
  intensity?: number

  /**
   * Color vibrancy and saturation
   * @default 1.0
   */
  vibrancy?: number

  /**
   * Wave frequency and complexity
   * @default 1.0
   */
  frequency?: number

  /**
   * Vertical stretch of aurora bands
   * @default 1.0
   */
  stretch?: number
}

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
    // This stops the blobs from stretching into ovals on wide screens
    vec2 uv = (fragCoord - 0.5 * iResolution.xy) / iResolution.y;

    // Apply the speed control uniform
    float time = iTime * u_speed;

    // Apply the stretch uniform (scaling the Y-axis if needed)
    uv.y *= u_stretch;

    // Generate moving points (blobs) using sine and cosine waves
    // We use u_frequency to alter how chaotic or wide the paths are
    vec2 p1 = vec2(sin(time * u_frequency * 0.8) * 0.6, cos(time * u_frequency * 0.5) * 0.4);
    vec2 p2 = vec2(cos(time * u_frequency * 0.6) * 0.5, sin(time * u_frequency * 0.9) * 0.5);
    vec2 p3 = vec2(sin(time * u_frequency * 1.2) * 0.4, cos(time * u_frequency * 1.1) * 0.3);
    vec2 p4 = vec2(cos(time * u_frequency * 0.7) * 0.7, sin(time * u_frequency * 0.4) * 0.6);

    // Sum the influences of all metaballs on the current pixel
    float field = 0.0;
    field += metaball(uv, p1, 0.15); // The last number is the radius
    field += metaball(uv, p2, 0.20);
    field += metaball(uv, p3, 0.12);
    field += metaball(uv, p4, 0.18);

    // Create the "blobbing" threshold effect using smoothstep for a soft, anti-aliased edge
    // Lower values = thicker connected blobs; higher values = smaller, separated blobs
    float blobMask = smoothstep(0.8, 1.2, field);

    // Create a dynamic color palette for the blobs based on their screen position
    vec3 color1 = vec3(0.2, 0.4, 1.0);  // Blue
    vec3 color2 = vec3(0.8, 0.2, 0.8);  // Purple
    vec3 color3 = vec3(0.0, 1.0, 0.8);  // Cyan

    // Mix colors across the screen to give the blobs a gradient aesthetic
    vec3 gradientColor = mix(color1, color2, sin(uv.x * 2.0 + time) * 0.5 + 0.5);
    gradientColor = mix(gradientColor, color3, cos(uv.y * 2.0 - time) * 0.5 + 0.5);

    // Apply the vibrancy uniform (saturation control)
    vec3 desaturated = vec3(dot(gradientColor, vec3(0.299, 0.587, 0.114)));
    gradientColor = mix(desaturated, gradientColor, u_vibrancy);

    // Apply the intensity uniform
    gradientColor *= u_intensity;

    // Set a background color (very dark blue/black)
    vec3 bgColor = vec3(0.02, 0.02, 0.05);

    // Combine the background and the blobs using the mask we created
    vec3 finalColor = mix(bgColor, gradientColor, blobMask);

    // Optional: Add a subtle ambient glow around the blobs based on the raw field value
    float glow = clamp(field * 0.15, 0.0, 1.0);
    finalColor += gradientColor * glow * 0.5;

    // Output final color
    fragColor = vec4(finalColor, 1.0);
}
`

export const AuroraShaders = forwardRef<HTMLDivElement, AuroraShadersProps>(
  (
    {
      className,
      speed = 1.0,
      intensity = 1.0,
      vibrancy = 1.0,
      frequency = 1.0,
      stretch = 1.0,
      ...props
    },
    ref,
  ) => {
    return (
      <div className={cn("w-full h-full", className)} ref={ref} {...(props as any)}>
        <Shader
          fs={blobShader}
          style={{ width: "100%", height: "100%" } as CSSStyleDeclaration}
          uniforms={{
            u_speed: { type: "1f", value: speed },
            u_intensity: { type: "1f", value: intensity },
            u_vibrancy: { type: "1f", value: vibrancy },
            u_frequency: { type: "1f", value: frequency },
            u_stretch: { type: "1f", value: stretch },
          }}
        />
      </div>
    )
  },
)

AuroraShaders.displayName = "AuroraShaders"

export default AuroraShaders
