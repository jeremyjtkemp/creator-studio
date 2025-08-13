import { Button } from "@/components/ui/button";
import { Menu, Sparkles } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useAuth } from "@/lib/auth-context";

export function Navbar() {
  const { user, signOutUser } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOutUser();
    } catch (error) {
      console.error('Sign out failed:', error);
    }
  };

  return (
    <header className="sticky top-0 z-50 flex items-center h-12 px-4 border-b shrink-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex items-center">
        <SidebarTrigger className="size-8">
          <Menu className="w-5 h-5" />
        </SidebarTrigger>
        <div className="flex items-center space-x-2 ml-3">
          <div className="w-6 h-6 rounded bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
            <Sparkles className="w-3 h-3 text-white" />
          </div>
          <span className="font-semibold">Creator Studio</span>
        </div>
      </div>
      <div className="flex items-center gap-3 ml-auto">
        {user && (
          <span className="text-sm text-muted-foreground">
            {user.displayName || user.email}
          </span>
        )}
        {user && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleSignOut}
          >
            Sign Out
          </Button>
        )}
      </div>
    </header>
  );
} 