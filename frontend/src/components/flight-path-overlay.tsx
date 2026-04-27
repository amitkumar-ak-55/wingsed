"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { MotionPathPlugin } from "gsap/MotionPathPlugin";
import { useGSAP } from "@gsap/react";

// Register plugins
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, MotionPathPlugin);
}

/**
 * FIXED PATH:
 * - Clean oval loop (no sharp turns)
 * - Smooth exit to the right
 * - Centered so plane never "disappears"
 */
const PATH_D = `
  M 200,500
  C 200,380 350,350 450,500
  C 350,650 200,620 200,500
  C 350,450 600,450 900,500
`;

export default function FlightPath() {
  const containerRef = useRef<HTMLDivElement>(null);
  const planeRef = useRef<SVGGElement>(null);

  useGSAP(
    () => {
      const plane = planeRef.current;
      if (!plane) return;

      gsap.to(plane, {
        ease: "power1.out", // smoother than linear
        motionPath: {
          path: "#flight-path",
          align: "#flight-path",
          alignOrigin: [0.5, 0.5],
          autoRotate: 90, // smoother rotation (less stiff)
        },
        scrollTrigger: {
          trigger: document.body,
          start: "top top",
          end: "bottom bottom",
          scrub: 2, // adds natural delay (important)
        },
      });
    },
    { scope: containerRef }
  );

  return (
    <div
      ref={containerRef}
      style={{
        position: "fixed",
        inset: 0,
        pointerEvents: "none",
        zIndex: 0,
        overflow: "hidden",
      }}
    >
      <svg viewBox="0 0 1000 1000" width="100%" height="100%">
        {/* Invisible motion path */}
        <path id="flight-path" d={PATH_D} fill="none" stroke="none" />

        {/* Plane */}
        <g
          ref={planeRef}
          style={{
            willChange: "transform",
            filter: "drop-shadow(0px 6px 12px rgba(0,0,0,0.3))",
          }}
        >
          {/* Better centered + scaled plane */}
          <g transform="scale(0.22) translate(-256, -256)">
            <path
              d="M512 32L32 288l160 64 64 160L512 32z"
              fill="#ede54aff" // changed to visible blue
            />
          </g>
        </g>
      </svg>
    </div>
  );
}