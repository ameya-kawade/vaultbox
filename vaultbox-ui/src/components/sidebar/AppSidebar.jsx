import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/features/login/context/auth';
import { useNotifications } from '@/features/notifications/NotificationContext';
import { Home, Video, MessageSquare, Hash, LogOut, Settings, ChevronDown, User } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Logo } from '@/components/ui/logo';

const navItems = [
  { icon: Home, label: 'Overview', path: '/dashboard' },
  { icon: Video, label: 'Video Meeting', path: '/video' },
  { icon: Hash, label: 'Channels', path: '/channels' },
  { icon: MessageSquare, label: 'Messages', path: '/messages' },
  { icon: Settings, label: 'Settings', path: '/settings' },
];

const getInitials = (name) =>
  name
    ? name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
    : 'U';

export function AppSidebar({ isOpen, onClose }) {
  const { user, isAuthenticated, logout } = useAuth();
  const { unreadCount } = useNotifications();
  const location = useLocation();

  if (!isAuthenticated) return null;

  return (
    <aside 
      className={`fixed inset-y-0 left-0 z-20 w-64 bg-card border-r border-border transform transition-transform duration-300 ease-in-out ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:translate-x-0`}
    >
      {/* Sidebar Header with Logo */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-border">
        <Logo />
        <Button variant="ghost" size="icon" onClick={onClose} className="lg:hidden">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-x"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
        </Button>
      </div>

      {/* Navigation */}
      <div className="overflow-y-auto h-[calc(100vh-4rem)]">
        <div className="px-3 py-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground px-3 py-2">
            Navigation
          </p>
          <nav className="mt-2 space-y-1">
            {navItems.map(({ icon: Icon, label, path }) => (
              <Link
                key={path}
                to={path}
                className={`flex items-center px-3 py-2 text-sm rounded-md transition-colors hover:bg-accent hover:text-accent-foreground ${
                  location.pathname.startsWith(path) ? 'bg-accent text-accent-foreground font-medium' : 'text-foreground'
                }`}
                onClick={() => onClose && window.innerWidth < 1024 && onClose()}
              >
                <Icon className="w-5 h-5 mr-3 flex-shrink-0" />
                <span>{label}</span>
              </Link>
            ))}
          </nav>
        </div>
      </div>

      {/* User Profile */}
      <div className="absolute bottom-0 left-0 right-0 border-t border-border p-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="w-full flex items-center justify-between p-2 hover:bg-accent rounded-md transition-colors"
            >
              <div className="flex items-center">
                <Avatar className="w-8 h-8 mr-2">
                  <AvatarImage src={user?.avatarUrl} alt={user?.name} />
                  <AvatarFallback>{getInitials(user?.name || 'User')}</AvatarFallback>
                </Avatar>
                <div className="flex flex-col text-left">
                  <span className="text-sm font-medium truncate max-w-[120px]">{user?.name || 'Guest'}</span>
                  <span className="text-xs text-muted-foreground truncate max-w-[120px]">
                    {user?.email || 'No Email'}
                  </span>
                </div>
              </div>
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
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
    </aside>
  );
}
