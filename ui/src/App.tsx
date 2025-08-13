import { AuthProvider, useAuth } from '@/lib/auth-context';
import { ProjectProvider } from '@/lib/project-context';
import { HookVisualsProvider } from '@/lib/hook-visuals-context';
import { AssetsProvider } from '@/lib/assets-context';
import { VideoCompositionProvider } from '@/lib/video-composition-context';
import { ThemeProvider } from "@/components/theme-provider";
import { LoginForm } from '@/components/login-form';
import { Navbar } from '@/components/navbar';
import { AppSidebar } from '@/components/appSidebar';
import { VideoCreator } from '@/pages/VideoCreator';
import { AssetLibrary } from '@/pages/AssetLibrary';
import { Analytics } from '@/pages/Analytics';
import { Archive } from '@/pages/Archive';
import { Settings } from '@/pages/Settings';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import {
  SidebarProvider,
  SidebarInset,
} from "@/components/ui/sidebar";

function AppContent() {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen"></div>;
  }

  return (
    <SidebarProvider>
      <div className="flex flex-col w-full min-h-screen bg-background grid-background">
        <Navbar />
        {!user ? (
          <main className="flex flex-col items-center justify-center flex-1 p-4">
            <LoginForm />
          </main>
        ) : (
          <ProjectProvider>
            <HookVisualsProvider>
              <AssetsProvider>
                <VideoCompositionProvider>
                  <div className="flex flex-1">
                    <AppSidebar />
                    <SidebarInset className="flex-1">
                      <main className="flex-1">
                        <Routes>
                          <Route path="/" element={<VideoCreator />} />
                          <Route path="/assets" element={<AssetLibrary />} />
                          <Route path="/analytics" element={<Analytics />} />
                          <Route path="/archive" element={<Archive />} />
                          <Route path="/settings" element={<Settings />} />
                        </Routes>
                      </main>
                    </SidebarInset>
                  </div>
                </VideoCompositionProvider>
              </AssetsProvider>
            </HookVisualsProvider>
          </ProjectProvider>
        )}
      </div>
    </SidebarProvider>
  );
}

function App() {
  return (
    <AuthProvider>
      <ThemeProvider 
        attribute="class" 
        defaultTheme="dark" 
        enableSystem={false}
        disableTransitionOnChange
        storageKey="creator-studio-theme"
      >
        <Router>
          <AppContent />
        </Router>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
