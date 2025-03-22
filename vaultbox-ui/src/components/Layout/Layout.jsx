import React, { useState, useEffect, createContext, useContext } from 'react';
import { Outlet, useLocation, Link } from 'react-router-dom';
import { AppSidebar } from '@/components/sidebar/AppSidebar';
import { useNotifications } from '@/features/notifications/NotificationContext';
import { 
  Breadcrumb, 
  BreadcrumbItem, 
  BreadcrumbLink, 
  BreadcrumbList, 
  BreadcrumbPage, 
  BreadcrumbSeparator 
} from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
import { Bell, Menu, Settings, User, LogOut, Home, Video, MessageSquare, Hash, Search, LayoutDashboard, Shield } from 'lucide-react';
import NotificationPanel from "@/features/notifications/NotificationPanel";
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/features/login/context/auth';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Switch } from '@/components/ui/switch';

// Create the cipher context
export const CipherContext = createContext({
  cipherMode: false,
  toggleCipherMode: () => {},
});

// Custom hook to use the cipher context
export const useCipher = () => useContext(CipherContext);

// Map routes to icons and names for breadcrumbs
const routeIcons = {
  '/': { icon: Home, name: 'Home' },
  '/dashboard': { icon: LayoutDashboard, name: 'Dashboard' },
  '/search': { icon: Search, name: 'Search' },
  '/video': { icon: Video, name: 'Video Meeting' },
  '/channels': { icon: Hash, name: 'Channels' },
  '/messages': { icon: MessageSquare, name: 'Messages' },
  '/settings': { icon: Settings, name: 'Settings' },
};

const getInitials = (name) =>
  name
    ? name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
    : 'U';

const Layout = () => {
  const location = useLocation();
  const [notifOpen, setNotifOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { notifications, unreadCount } = useNotifications();
  const { user, logout } = useAuth();
  
  // Add cipher mode state
  const [cipherMode, setCipherMode] = useState(false);
  
  // Determine if we're on a messages or channels page
  const isMessagesOrChannelsPage = location.pathname.includes('/messages') || 
                                 location.pathname.includes('/channels');

  // Handle sidebar visibility on resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        // On large screens, we don't need to manage sidebar visibility
        // as it's always visible via CSS (lg:translate-x-0)
        setIsSidebarOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // Initial check
    
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const getBreadcrumbs = () => {
    const pathnames = location.pathname.split('/').filter((x) => x);
    const breadcrumbs = [];
    let currentPath = '';

    breadcrumbs.push({
      path: '/',
      isLast: pathnames.length === 0,
    });

    pathnames.forEach((name, index) => {
      currentPath += `/${name}`;
      breadcrumbs.push({
        path: currentPath,
        isLast: index === pathnames.length - 1,
      });
    });

    return breadcrumbs;
  };

  const toggleCipherMode = () => {
    setCipherMode(prev => !prev);
  };

  return (
    <CipherContext.Provider value={{ cipherMode, toggleCipherMode }}>
      <div className="flex h-screen overflow-hidden bg-background">
        {/* Sidebar */}
        <AppSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
        
        {/* Main Content */}
        <div className="flex flex-col flex-1 w-full lg:pl-64">
          {/* Header - Fixed height and width */}
          <header className="h-16 flex items-center px-4 border-b border-border shrink-0 bg-card/50 w-full">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleSidebar}
              className="mr-4 lg:hidden"
            >
              <Menu className="h-5 w-5" />
            </Button>
            
            {/* Breadcrumb with fixed width and icon-only on small screens */}
            <div className="flex-1 min-w-0 max-w-full">
              <Breadcrumb className="overflow-hidden">
                <BreadcrumbList className="flex items-center">
                  {getBreadcrumbs().map((breadcrumb, index) => {
                    const routeInfo = routeIcons[breadcrumb.path] || { 
                      icon: Hash, 
                      name: breadcrumb.path.split('/').pop() 
                    };
                    const IconComponent = routeInfo.icon;
                    
                    return (
                      <React.Fragment key={breadcrumb.path}>
                        {index > 0 && <BreadcrumbSeparator className="mx-1" />}
                        <BreadcrumbItem className="flex-shrink-0">
                          {breadcrumb.isLast ? (
                            <BreadcrumbPage className="flex items-center">
                              <IconComponent className="h-4 w-4" />
                              <span className="hidden sm:inline ml-1.5">{routeInfo.name}</span>
                            </BreadcrumbPage>
                          ) : (
                            <BreadcrumbLink href={breadcrumb.path} className="flex items-center">
                              <IconComponent className="h-4 w-4" />
                              <span className="hidden sm:inline ml-1.5">{routeInfo.name}</span>
                            </BreadcrumbLink>
                          )}
                        </BreadcrumbItem>
                      </React.Fragment>
                    );
                  })}
                </BreadcrumbList>
              </Breadcrumb>
            </div>
            
            <div className="flex items-center gap-4 ml-auto">
              {/* Cipher Toggle - Only show on messages/channels pages */}
              {isMessagesOrChannelsPage && (
                <div className="flex items-center gap-2">
                  <Switch 
                    checked={cipherMode}
                    onCheckedChange={toggleCipherMode}
                    id="cipher-mode"
                  />
                  <label htmlFor="cipher-mode" className="text-sm font-medium cursor-pointer flex items-center gap-1.5">
                    <Shield className="h-4 w-4" /> 
                    <span className="hidden sm:inline">Cipher Mode</span>
                  </label>
                </div>
              )}
              
              <Button
                variant="ghost"
                size="icon"
                className="relative hover:bg-accent"
                onClick={() => setNotifOpen(true)}
              >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-0 right-0 h-4 w-4 rounded-full bg-primary text-[10px] font-medium text-primary-foreground flex items-center justify-center">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </Button>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user?.avatarUrl} alt={user?.name} />
                      <AvatarFallback>{getInitials(user?.name || 'User')}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link to="/profile" className="flex items-center">
                      <User className="mr-2 h-4 w-4" />
                      <span>Profile</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/settings" className="flex items-center">
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Settings</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={logout} className="text-destructive">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Logout</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </header>
          
          {/* Main Content Area - Full width with proper overflow */}
          <main className="flex-1 overflow-auto w-full h-[calc(100vh-4rem)]">
            <div className="h-full w-screen max-w-full px-4 py-6">
              <Outlet />
            </div>
          </main>
        </div>

        {/* Overlay for mobile when sidebar is open */}
        {isSidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-10 lg:hidden" 
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Notification Panel */}
        <NotificationPanel isOpen={notifOpen} onClose={() => setNotifOpen(false)} />
      </div>
    </CipherContext.Provider>
  );
};

export default Layout;