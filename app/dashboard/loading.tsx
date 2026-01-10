import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Loader } from "@/components/ui/loader";

/**
 * Loading skeleton for Dashboard page
 * Shows while the dashboard page is being generated on the server
 */
export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4 py-12">
        <div className="mx-auto max-w-4xl">
          {/* Header Skeleton */}
          <div className="mb-8 flex items-center justify-between">
            <div className="space-y-2">
              <div className="h-9 w-48 animate-pulse rounded bg-muted" />
              <div className="h-5 w-64 animate-pulse rounded bg-muted" />
            </div>
            <div className="h-10 w-24 animate-pulse rounded bg-muted" />
          </div>

          {/* Subscription Card Skeleton */}
          <Card className="mb-8">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 animate-pulse rounded-full bg-muted" />
                <div className="space-y-2 flex-1">
                  <div className="h-6 w-48 animate-pulse rounded bg-muted" />
                  <div className="h-4 w-64 animate-pulse rounded bg-muted" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="h-5 w-32 animate-pulse rounded bg-muted" />
                <div className="h-6 w-48 animate-pulse rounded bg-muted" />
              </div>
            </CardContent>
          </Card>

          {/* Welcome Card Skeleton */}
          <Card className="mb-8">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 animate-pulse rounded-full bg-muted" />
                <div className="space-y-2 flex-1">
                  <div className="h-6 w-48 animate-pulse rounded bg-muted" />
                  <div className="h-4 w-64 animate-pulse rounded bg-muted" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="h-4 w-16 animate-pulse rounded bg-muted" />
                  <div className="h-6 w-64 animate-pulse rounded bg-muted" />
                </div>
                <div className="space-y-2">
                  <div className="h-4 w-16 animate-pulse rounded bg-muted" />
                  <div className="h-4 w-32 animate-pulse rounded bg-muted font-mono" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Placeholder Cards Skeleton */}
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <div className="h-6 w-40 animate-pulse rounded bg-muted mb-2" />
                <div className="h-4 w-56 animate-pulse rounded bg-muted" />
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-4 w-full animate-pulse rounded bg-muted" />
                  <div className="h-4 w-full animate-pulse rounded bg-muted" />
                  <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="h-6 w-32 animate-pulse rounded bg-muted mb-2" />
                <div className="h-4 w-48 animate-pulse rounded bg-muted" />
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-4 w-full animate-pulse rounded bg-muted" />
                  <div className="h-4 w-full animate-pulse rounded bg-muted" />
                  <div className="h-4 w-2/3 animate-pulse rounded bg-muted" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
