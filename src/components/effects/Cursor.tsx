"use client";
import { useEffect } from "react";
import useFluidCursor from "@/hooks/use-FluidCursor";

const Cursor = () => {
  useEffect(() => {
    useFluidCursor();
  }, []);

  return (
    <div className="fixed top-0 left-0 z-0">
      <canvas id="fluid" className="fixed top-0 left-0 w-full h-full -z-10" />
    </div>
  );
};

export default Cursor;
