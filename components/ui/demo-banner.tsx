"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Demo Banner Component
 * Dismissible top banner indicating this is a demo/portfolio project
 */
export function DemoBanner() {
  const [isDismissed, setIsDismissed] = useState(true);

  useEffect(() => {
    // Check if banner was previously dismissed
    const dismissed = localStorage.getItem("demo-banner-dismissed");
    setIsDismissed(dismissed === "true");
  }, []);

  const handleDismiss = () => {
    setIsDismissed(true);
    localStorage.setItem("demo-banner-dismissed", "true");
  };

  if (isDismissed) {
    return null;
  }

  return (
    <div className="bg-yellow-100 border-b border-yellow-200">
      <div className="container mx-auto px-4 py-2">
        <div className="flex items-center justify-between gap-4">
          <p className="text-sm text-yellow-800 flex-1 text-center">
            🚧 This is a Demo/Portfolio project. Payments are in Test Mode. No real services are provided.
          </p>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 text-yellow-800 hover:bg-yellow-200"
            onClick={handleDismiss}
            aria-label="Dismiss banner"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
