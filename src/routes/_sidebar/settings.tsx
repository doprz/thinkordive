import { createFileRoute, useRouter } from "@tanstack/react-router";
import {
  Clock,
  LogOut,
  Mail,
  Moon,
  ShieldCheck,
  Sun,
  UserCircle,
} from "lucide-react";
import { authClient } from "@/auth/auth-client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { useTheme } from "@/lib/theme-provider";
import { authMiddleware } from "@/middleware/auth";

export const Route = createFileRoute("/_sidebar/settings")({
  component: SettingsPage,
  server: {
    middleware: [authMiddleware],
  },
});

function ThemeToggle() {
  const { setTheme } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <Button variant="outline" size="icon">
          <Sun className="h-[1.2rem] w-[1.2rem] scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        <DropdownMenuItem onClick={() => setTheme("light")}>
          Light
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")}>
          Dark
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("system")}>
          System
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function InfoRow({
  icon,
  label,
  value,
}: {
  icon?: React.ReactNode;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1">
      <p className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {icon}
        {label}
      </p>
      <div className="text-sm">{value}</div>
    </div>
  );
}

function SettingsPage() {
  const { data: sessionData, isPending } = authClient.useSession();
  const router = useRouter();

  const handleSignOut = async () => {
    await authClient.signOut();
    router.navigate({ to: "/" });
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage your account and application preferences.
        </p>
      </div>

      <Separator className="mb-8" />

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <UserCircle className="h-4 w-4" />
              Profile
            </CardTitle>
            <CardDescription>Your account details.</CardDescription>
          </CardHeader>
          <CardContent>
            {isPending ? (
              <ProfileSkeleton />
            ) : !sessionData ? (
              <p className="text-sm text-muted-foreground">Not signed in.</p>
            ) : (
              <ProfileContent
                user={sessionData.user}
                session={sessionData.session}
                onSignOut={handleSignOut}
              />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Appearance</CardTitle>
            <CardDescription>
              Choose how the interface looks for you.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ThemeToggle />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function ProfileContent({
  user,
  session,
  onSignOut,
}: {
  user: NonNullable<ReturnType<typeof authClient.useSession>["data"]>["user"];
  session: NonNullable<
    ReturnType<typeof authClient.useSession>["data"]
  >["session"];
  onSignOut: () => void;
}) {
  const initials = user.name
    ? user.name
        .split(" ")
        .map((n: string) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : (user.email?.[0]?.toUpperCase() ?? "?");

  const createdAt = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : null;

  const sessionExpiry = session.expiresAt
    ? new Date(session.expiresAt).toLocaleString("en-US", {
        dateStyle: "medium",
        timeStyle: "short",
      })
    : null;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Avatar className="h-14 w-14">
          <AvatarImage
            src={user.image ?? undefined}
            alt={user.name ?? "User"}
          />
          <AvatarFallback className="text-base">{initials}</AvatarFallback>
        </Avatar>
        <div className="space-y-1">
          <p className="font-medium leading-none">
            {user.name ?? "Unnamed User"}
          </p>
          <p className="text-sm text-muted-foreground">{user.email}</p>
          {user.role && (
            <Badge variant="secondary" className="capitalize text-xs">
              {user.role}
            </Badge>
          )}
        </div>
      </div>

      <Separator />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <InfoRow
          icon={<Mail className="h-3.5 w-3.5" />}
          label="Email"
          value={user.email ?? "—"}
        />
        <InfoRow
          icon={<ShieldCheck className="h-3.5 w-3.5" />}
          label="Email verified"
          value={
            user.emailVerified ? (
              <Badge variant="default" className="text-xs">
                Verified
              </Badge>
            ) : (
              <Badge variant="destructive" className="text-xs">
                Unverified
              </Badge>
            )
          }
        />
        {createdAt && (
          <InfoRow
            icon={<Clock className="h-3.5 w-3.5" />}
            label="Member since"
            value={createdAt}
          />
        )}
        {sessionExpiry && (
          <InfoRow label="Session expires" value={sessionExpiry} />
        )}
      </div>

      <Separator />

      <Button variant="destructive" size="sm" onClick={onSignOut}>
        <LogOut className="mr-2 h-4 w-4" />
        Sign out
      </Button>
    </div>
  );
}

function ProfileSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Skeleton className="h-14 w-14 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-36" />
          <Skeleton className="h-3 w-48" />
        </div>
      </div>
      <Separator />
      <div className="grid grid-cols-2 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: TODO:
          <div key={i} className="space-y-1">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-4 w-32" />
          </div>
        ))}
      </div>
    </div>
  );
}
