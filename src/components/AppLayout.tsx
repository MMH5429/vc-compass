import { useState, useEffect } from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { LayoutDashboard, Building2, List, Bookmark, Search, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import GlobalSearch from './GlobalSearch';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Companies', href: '/companies', icon: Building2 },
  { name: 'Lists', href: '/lists', icon: List },
  { name: 'Saved Searches', href: '/saved', icon: Bookmark },
];

export default function AppLayout() {
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setSearchOpen((open) => !open);
      }
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  return (
    <div className="flex h-screen bg-background text-foreground">
      <aside className="w-58 border-r border-border flex flex-col bg-card shrink-0" style={{ width: '232px' }}>

        {/* Logo */}
        <div className="px-4 py-5 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-blue-400 flex items-center justify-center shadow-sm">
              <Zap className="h-4 w-4 text-white" />
            </div>
            <div>
              <span className="font-display font-bold text-base tracking-tight leading-none block">Vektor</span>
              <span className="text-[10px] text-muted-foreground font-mono leading-none">VC Intelligence</span>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="px-3 pt-3 pb-1">
          <Button
            variant="outline"
            className="w-full justify-start text-muted-foreground text-sm h-9 bg-background hover:bg-muted/50"
            onClick={() => setSearchOpen(true)}
          >
            <Search className="h-3.5 w-3.5 mr-2 shrink-0" />
            <span className="flex-1 text-left">Search…</span>
            <kbd className="text-[10px] font-mono bg-muted px-1.5 py-0.5 rounded text-muted-foreground border border-border">
              ⌘K
            </kbd>
          </Button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 pt-2 space-y-0.5">
          <p className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">
            Navigation
          </p>
          {navigation.map((item) => (
            <NavLink
              key={item.name}
              to={item.href}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-primary/10 text-primary border border-primary/15'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground border border-transparent'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <item.icon className={`h-4 w-4 shrink-0 ${isActive ? 'text-primary' : ''}`} />
                  {item.name}
                  {isActive && (
                    <span className="ml-auto w-1.5 h-1.5 rounded-full bg-primary" />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div className="px-4 py-4 border-t border-border">
          <div className="flex items-center gap-2">
            <div className="h-5 w-5 rounded bg-primary/10 flex items-center justify-center">
              <Zap className="h-2.5 w-2.5 text-primary" />
            </div>
            <span className="text-[11px] text-muted-foreground font-mono">v1.0.0</span>
          </div>
        </div>
      </aside>

      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>

      <GlobalSearch open={searchOpen} onOpenChange={setSearchOpen} />
    </div>
  );
}
