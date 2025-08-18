"use client";
import { useEffect } from "react";
import fluidCursor from "@/hooks/use-FluidCursor";

const Cursor = () => {
  useEffect(() => {
    // Call the fluid cursor initialization function
    const cleanup = fluidCursor();
    
    // Return cleanup function if provided
    return cleanup;
  }, []);

  return (
    <canvas
      id="fluid"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: 0,
      }}
    />
  );
};

export default Cursor;
