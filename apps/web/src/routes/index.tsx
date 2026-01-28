import { createFileRoute, Navigate } from "@tanstack/react-router";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  const { isAuthenticated } = useAuth();

  // Temporary: assume the user is admin
  if (isAuthenticated) {
    return <Navigate to="/admin" />;
  }

  // TODO: Handle regular users

  return <Navigate to="/login" />;
}
