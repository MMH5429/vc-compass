import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { mockCompanies } from '@/data/mockCompanies';
import {
  Building2, LayoutDashboard, List, Bookmark,
  ArrowRight, Zap, DollarSign,
} from 'lucide-react';

interface GlobalSearchProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const avatarColors = [
  'bg-blue-500/20 text-blue-400',
  'bg-violet-500/20 text-violet-400',
  'bg-emerald-500/20 text-emerald-400',
  'bg-amber-500/20 text-amber-400',
  'bg-pink-500/20 text-pink-400',
  'bg-cyan-500/20 text-cyan-400',
];

const stageColor: Record<string, string> = {
  'Seed': 'bg-emerald-500/15 text-emerald-400',
  'Series A': 'bg-blue-500/15 text-blue-400',
  'Series B': 'bg-violet-500/15 text-violet-400',
  'Series C': 'bg-amber-500/15 text-amber-400',
};

const quickLinks = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, description: 'Pipeline overview' },
  { label: 'Companies', href: '/companies', icon: Building2, description: 'Browse all companies' },
  { label: 'Lists', href: '/lists', icon: List, description: 'Your collections' },
  { label: 'Saved Searches', href: '/saved', icon: Bookmark, description: 'Re-run past queries' },
];

export default function GlobalSearch({ open, onOpenChange }: GlobalSearchProps) {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');

  const go = (href: string) => {
    navigate(href);
    onOpenChange(false);
    setQuery('');
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { onOpenChange(v); if (!v) setQuery(''); }}>
      <DialogContent className="overflow-hidden p-0 max-w-xl gap-0 border-border shadow-2xl">
        <Command className="[&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:font-semibold [&_[cmdk-group-heading]]:text-muted-foreground [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-widest [&_[cmdk-group-heading]]:text-[10px] [&_[cmdk-group]]:px-2 [&_[cmdk-input]]:h-14 [&_[cmdk-item]]:px-2 [&_[cmdk-item]]:py-2.5 [&_[cmdk-input-wrapper]_svg]:h-4 [&_[cmdk-input-wrapper]_svg]:w-4">

          {/* Input */}
          <div className="flex items-center border-b border-border px-4 gap-3">
            <Zap className="h-4 w-4 text-primary shrink-0" />
            <CommandInput
              placeholder="Search companies, pages…"
              value={query}
              onValueChange={setQuery}
              className="border-0 focus:ring-0 px-0 text-sm placeholder:text-muted-foreground/60"
            />
            <kbd className="text-[10px] font-mono bg-muted border border-border px-1.5 py-0.5 rounded text-muted-foreground shrink-0">
              ESC
            </kbd>
          </div>

          <CommandList className="max-h-[420px] overflow-y-auto">
            <CommandEmpty>
              <div className="py-12 text-center">
                <Building2 className="h-8 w-8 mx-auto text-muted-foreground/30 mb-3" />
                <p className="text-sm font-medium text-muted-foreground">No results for "{query}"</p>
                <p className="text-xs text-muted-foreground/60 mt-1">Try a company name, industry, or tag</p>
              </div>
            </CommandEmpty>

            {/* Quick navigation — shown when input is empty */}
            {!query && (
              <CommandGroup heading="Quick Navigation">
                {quickLinks.map((link) => (
                  <CommandItem
                    key={link.href}
                    value={link.label}
                    onSelect={() => go(link.href)}
                    className="flex items-center gap-3 rounded-lg cursor-pointer"
                  >
                    <div className="h-8 w-8 rounded-lg bg-muted border border-border flex items-center justify-center shrink-0">
                      <link.icon className="h-3.5 w-3.5 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{link.label}</p>
                      <p className="text-xs text-muted-foreground">{link.description}</p>
                    </div>
                    <ArrowRight className="h-3.5 w-3.5 text-muted-foreground/40 shrink-0" />
                  </CommandItem>
                ))}
              </CommandGroup>
            )}

            {!query && <CommandSeparator />}

            {/* Companies */}
            <CommandGroup heading={query ? 'Companies' : 'All Companies'}>
              {mockCompanies.map((company, idx) => (
                <CommandItem
                  key={company.id}
                  value={`${company.name} ${company.domain} ${company.industry} ${company.tags.join(' ')}`}
                  onSelect={() => go(`/companies/${company.id}`)}
                  className="flex items-center gap-3 rounded-lg cursor-pointer"
                >
                  {/* Avatar */}
                  <div className={`h-8 w-8 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${avatarColors[idx % avatarColors.length]}`}>
                    {company.name.charAt(0)}
                  </div>

                  {/* Name + domain */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate">{company.name}</p>
                    <p className="text-xs text-muted-foreground font-mono truncate">{company.domain}</p>
                  </div>

                  {/* Industry */}
                  <span className="text-xs text-muted-foreground hidden sm:block truncate max-w-[120px] shrink-0">
                    {company.industry}
                  </span>

                  {/* Stage */}
                  <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-md shrink-0 hidden sm:block ${stageColor[company.stage] || 'bg-muted text-muted-foreground'}`}>
                    {company.stage}
                  </span>

                  {/* Funding */}
                  <span className="text-xs font-mono text-muted-foreground shrink-0 hidden md:block">
                    {company.funding}
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>

          {/* Footer */}
          <div className="border-t border-border px-4 py-2.5 flex items-center justify-between bg-muted/30">
            <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
              <span className="flex items-center gap-1">
                <kbd className="font-mono bg-background border border-border px-1 py-0.5 rounded text-[10px]">↑</kbd>
                <kbd className="font-mono bg-background border border-border px-1 py-0.5 rounded text-[10px]">↓</kbd>
                navigate
              </span>
              <span className="flex items-center gap-1">
                <kbd className="font-mono bg-background border border-border px-1.5 py-0.5 rounded text-[10px]">↵</kbd>
                select
              </span>
              <span className="flex items-center gap-1">
                <kbd className="font-mono bg-background border border-border px-1.5 py-0.5 rounded text-[10px]">esc</kbd>
                close
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
              <Zap className="h-3 w-3 text-primary" />
              <span className="font-mono">Vektor</span>
            </div>
          </div>
        </Command>
      </DialogContent>
    </Dialog>
  );
}
