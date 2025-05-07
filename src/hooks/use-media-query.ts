"use client";

import { useEffect, useState } from "react";

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);
  
  useEffect(() => {
    const media = window.matchMedia(query);
    
    // Update the state initially
    setMatches(media.matches);
    
    // Define listener function
    const listener = (e: MediaQueryListEvent) => {
      setMatches(e.matches);
    };
    
    // Add the listener
    media.addEventListener("change", listener);
    
    // Remove listener on cleanup
    return () => {
      media.removeEventListener("change", listener);
    };
  }, [query]);
  
  return matches;
}