"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Loader } from "@/components/ui/loader";
import { CreditCard } from "lucide-react";

/**
 * Manage Subscription Button Component
 * Opens Stripe Customer Portal for subscription management
 */
export function ManageSubscriptionButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleManageSubscription = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/stripe/portal", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create portal session");
      }

      // Redirect to Stripe Customer Portal
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error("No portal URL returned");
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An error occurred";
      setError(errorMessage);
      console.error("Error creating portal session:", err);
      setLoading(false);
    }
  };

  return (
    <div>
      {error && (
        <p className="mb-2 text-sm text-destructive">{error}</p>
      )}
      <Button
        onClick={handleManageSubscription}
        disabled={loading}
        variant="outline"
      >
        {loading ? (
          <>
            <Loader size="sm" className="mr-2" />
            Carregando...
          </>
        ) : (
          <>
            <CreditCard className="mr-2 h-4 w-4" />
            Gerenciar Assinatura
          </>
        )}
      </Button>
    </div>
  );
}
