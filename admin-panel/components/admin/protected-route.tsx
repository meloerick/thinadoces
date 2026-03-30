"use client";

interface ProtectedRouteProps {
  authenticated: boolean;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function ProtectedRoute({ authenticated, children, fallback = null }: ProtectedRouteProps) {
  if (!authenticated) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
