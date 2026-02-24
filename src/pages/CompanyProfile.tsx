import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft, Globe, MapPin, Users, Calendar, DollarSign, Zap,
  Plus, Trash2, Send, RefreshCw, Loader2, ExternalLink,
  FileText, Sparkles, CheckCircle2, Clock, Tag,
  AlertCircle, Key, Code2, Link2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { mockCompanies } from '@/data/mockCompanies';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import type { CompanyList, Note, EnrichmentResult } from '@/lib/types';
import { enrichCompany, EnrichmentApiError } from '@/lib/enrichmentApi';
import { toast } from 'sonner';

const signalTypeColor: Record<string, string> = {
  hiring: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20',
  product: 'bg-blue-500/15 text-blue-400 border-blue-500/20',
  funding: 'bg-amber-500/15 text-amber-400 border-amber-500/20',
  partnership: 'bg-purple-500/15 text-purple-400 border-purple-500/20',
  press: 'bg-pink-500/15 text-pink-400 border-pink-500/20',
  tech: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/20',
};

const signalBorderColor: Record<string, string> = {
  hiring: 'border-l-emerald-500',
  product: 'border-l-blue-500',
  funding: 'border-l-amber-500',
  partnership: 'border-l-violet-500',
  press: 'border-l-pink-500',
  tech: 'border-l-cyan-500',
};

const stageColor: Record<string, string> = {
  'Seed': 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/25',
  'Series A': 'bg-blue-500/15 text-blue-400 border border-blue-500/25',
  'Series B': 'bg-violet-500/15 text-violet-400 border border-violet-500/25',
  'Series C': 'bg-amber-500/15 text-amber-400 border border-amber-500/25',
};

const avatarColors = [
  'from-blue-600 to-blue-400',
  'from-violet-600 to-violet-400',
  'from-emerald-600 to-emerald-400',
  'from-amber-600 to-amber-400',
  'from-pink-600 to-pink-400',
  'from-cyan-600 to-cyan-400',
];

const confidenceStyle: Record<string, string> = {
  high: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/25',
  medium: 'bg-amber-500/15 text-amber-400 border border-amber-500/25',
  low: 'bg-muted text-muted-foreground border border-border',
};

export default function CompanyProfile() {
  const { id } = useParams();
  const company = mockCompanies.find((c) => c.id === id);
  const companyIndex = mockCompanies.findIndex((c) => c.id === id);
  const [notes, setNotes] = useLocalStorage<Note[]>('vc-notes', []);
  const [lists] = useLocalStorage<CompanyList[]>('vc-lists', []);
  const [, setLists] = useLocalStorage<CompanyList[]>('vc-lists', []);
  const [enrichmentCache, setEnrichmentCache] = useLocalStorage<Record<string, EnrichmentResult>>(
    'vc-enrichments',
    {}
  );
  const [newNote, setNewNote] = useState('');
  const [enriching, setEnriching] = useState(false);
  const [enrichError, setEnrichError] = useState<string | null>(null);
  const [enrichErrorCode, setEnrichErrorCode] = useState<string | null>(null);
  const [selectedList, setSelectedList] = useState('');

  if (!company) {
    return (
      <div className="p-6 flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="h-16 w-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
          <FileText className="h-7 w-7 text-muted-foreground" />
        </div>
        <h2 className="text-lg font-display font-semibold mb-1">Company not found</h2>
        <p className="text-sm text-muted-foreground mb-4">This company doesn't exist or was removed.</p>
        <Link to="/companies">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" /> Back to companies
          </Button>
        </Link>
      </div>
    );
  }

  const companyNotes = notes.filter((n) => n.companyId === id);
  const enrichment = enrichmentCache[company.id];
  const avatarGradient = avatarColors[companyIndex % avatarColors.length];

  const addNote = () => {
    if (!newNote.trim()) return;
    const note: Note = {
      id: Date.now().toString(),
      companyId: company.id,
      content: newNote,
      createdAt: new Date().toISOString(),
    };
    setNotes((prev) => [...prev, note]);
    setNewNote('');
    toast.success('Note added');
  };

  const deleteNote = (noteId: string) => {
    setNotes((prev) => prev.filter((n) => n.id !== noteId));
    toast.success('Note deleted');
  };

  const addToList = () => {
    if (!selectedList) return;
    setLists((prev) =>
      prev.map((l) =>
        l.id === selectedList
          ? { ...l, companyIds: [...new Set([...l.companyIds, company.id])], updatedAt: new Date().toISOString() }
          : l
      )
    );
    toast.success('Added to list');
    setSelectedList('');
  };

  const handleEnrich = async () => {
    setEnriching(true);
    setEnrichError(null);
    setEnrichErrorCode(null);
    try {
      const result = await enrichCompany(company.domain, company.id);
      setEnrichmentCache((prev) => ({ ...prev, [company.id]: result }));
      toast.success('Enrichment complete');
    } catch (err) {
      if (err instanceof EnrichmentApiError) {
        setEnrichErrorCode(err.code);
        const messages: Record<string, string> = {
          NO_API_KEY: 'No Clearbit API key configured. See setup instructions below.',
          INVALID_API_KEY: 'API key is invalid or expired. Check your VITE_CLEARBIT_API_KEY.',
          NOT_FOUND: `No Clearbit data found for ${company.domain}. This domain may not be indexed.`,
          RATE_LIMITED: 'Rate limit reached. Please wait and try again.',
          API_ERROR: 'Clearbit returned an unexpected error. Please try again.',
        };
        setEnrichError(messages[err.code] ?? err.message);
      } else {
        setEnrichError('Unexpected error. Please try again.');
      }
      toast.error('Enrichment failed');
    } finally {
      setEnriching(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">

      {/* Breadcrumb */}
      <div className="px-6 pt-6">
        <Link
          to="/companies"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors group"
        >
          <ArrowLeft className="h-3.5 w-3.5 group-hover:-translate-x-0.5 transition-transform" />
          Back to companies
        </Link>
      </div>

      {/* Hero */}
      <div className="px-6 pt-5 pb-6 border-b border-border">
        <div className="flex items-start gap-5">
          {/* Avatar */}
          <div className={`h-16 w-16 rounded-2xl bg-gradient-to-br ${avatarGradient} flex items-center justify-center text-2xl font-bold text-white shrink-0 shadow-lg`}>
            {company.name.charAt(0)}
          </div>

          {/* Name + description + tags */}
          <div className="flex-1 min-w-0 space-y-2">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <h1 className="text-3xl font-display font-bold tracking-tight leading-tight">
                  {company.name}
                </h1>
                <a
                  href={`https://${company.domain}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors mt-0.5 font-mono"
                >
                  <Globe className="h-3 w-3" />
                  {company.domain}
                  <ExternalLink className="h-2.5 w-2.5" />
                </a>
              </div>

              {/* Actions */}
              <div className="flex gap-2 items-center shrink-0">
                <Select value={selectedList} onValueChange={setSelectedList}>
                  <SelectTrigger className="w-36 h-9 text-sm">
                    <SelectValue placeholder="Add to list" />
                  </SelectTrigger>
                  <SelectContent>
                    {lists.length === 0 && (
                      <div className="px-2 py-1.5 text-sm text-muted-foreground">No lists yet</div>
                    )}
                    {lists.map((l) => (
                      <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button size="sm" onClick={addToList} disabled={!selectedList}>
                  <Plus className="h-3.5 w-3.5 mr-1" /> Add
                </Button>
              </div>
            </div>

            <p className="text-muted-foreground leading-relaxed max-w-2xl">{company.description}</p>

            <div className="flex flex-wrap gap-1.5 pt-0.5">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-semibold ${stageColor[company.stage] || 'bg-muted text-muted-foreground'}`}>
                {company.stage}
              </span>
              {company.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs font-normal">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        </div>

        {/* Meta strip */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mt-6">
          {[
            { icon: MapPin, label: 'Location', value: company.location },
            { icon: Users, label: 'Employees', value: company.employees },
            { icon: Calendar, label: 'Founded', value: String(company.founded) },
            { icon: DollarSign, label: 'Funding', value: company.funding },
            { icon: Zap, label: 'Stage', value: company.stage },
            { icon: Globe, label: 'Domain', value: company.domain },
          ].map((item) => (
            <div key={item.label} className="bg-muted/40 border border-border rounded-xl p-3 space-y-1.5">
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <item.icon className="h-3 w-3 shrink-0" />
                <span className="text-[10px] uppercase tracking-widest font-semibold">{item.label}</span>
              </div>
              <p className="font-semibold text-sm truncate leading-tight">{item.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="px-6 py-6">
        <Tabs defaultValue="signals">
          <TabsList className="h-10 p-1 gap-1">
            <TabsTrigger value="signals" className="gap-1.5 text-sm">
              <Zap className="h-3.5 w-3.5" />
              Signals
              <span className="ml-1 text-xs bg-muted px-1.5 py-0.5 rounded font-mono">
                {company.signals.length}
              </span>
            </TabsTrigger>
            <TabsTrigger value="notes" className="gap-1.5 text-sm">
              <FileText className="h-3.5 w-3.5" />
              Notes
              {companyNotes.length > 0 && (
                <span className="ml-1 text-xs bg-muted px-1.5 py-0.5 rounded font-mono">
                  {companyNotes.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="enrichment" className="gap-1.5 text-sm">
              <Sparkles className="h-3.5 w-3.5" />
              Enrichment
              {enrichment && <CheckCircle2 className="h-3 w-3 text-emerald-400 ml-1" />}
            </TabsTrigger>
          </TabsList>

          {/* ── Signals ── */}
          <TabsContent value="signals" className="mt-5 space-y-3">
            {company.signals.length === 0 && (
              <div className="text-center py-16 text-muted-foreground text-sm">
                No signals recorded yet.
              </div>
            )}
            {company.signals.map((signal, i) => (
              <div
                key={i}
                className={`flex gap-4 p-4 bg-card border border-border border-l-2 ${signalBorderColor[signal.type] || 'border-l-border'} rounded-xl`}
              >
                <div className="flex-1 min-w-0 space-y-1.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold border ${signalTypeColor[signal.type] || ''}`}
                    >
                      {signal.type}
                    </span>
                    <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {new Date(signal.date).toLocaleDateString('en-US', {
                        month: 'short', day: 'numeric', year: 'numeric',
                      })}
                    </span>
                  </div>
                  <p className="font-semibold text-sm">{signal.title}</p>
                  <p className="text-sm text-muted-foreground leading-relaxed">{signal.description}</p>
                </div>
              </div>
            ))}
          </TabsContent>

          {/* ── Notes ── */}
          <TabsContent value="notes" className="mt-5 space-y-4">
            {/* Compose */}
            <div className="bg-card border border-border rounded-xl p-4 space-y-3">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
                New Note
              </p>
              <Textarea
                placeholder="Write a note about this company…"
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                className="min-h-[88px] resize-none bg-background text-sm"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) addNote();
                }}
              />
              <div className="flex items-center justify-between">
                <p className="text-[11px] text-muted-foreground">
                  <kbd className="font-mono bg-muted px-1 py-0.5 rounded text-[10px]">⌘</kbd>
                  {' + '}
                  <kbd className="font-mono bg-muted px-1 py-0.5 rounded text-[10px]">Enter</kbd>
                  {' to save'}
                </p>
                <Button onClick={addNote} disabled={!newNote.trim()} size="sm">
                  <Send className="h-3.5 w-3.5 mr-1.5" /> Save note
                </Button>
              </div>
            </div>

            {/* Notes list */}
            {companyNotes.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <FileText className="h-8 w-8 mx-auto mb-3 opacity-30" />
                <p className="text-sm">No notes yet. Add one above.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {companyNotes.map((note) => (
                  <div key={note.id} className="bg-card border border-border rounded-xl p-4 group">
                    <div className="flex justify-between items-start gap-3">
                      <p className="text-sm leading-relaxed whitespace-pre-wrap flex-1">{note.content}</p>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteNote(note.id)}
                        className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity h-7 w-7 p-0"
                      >
                        <Trash2 className="h-3.5 w-3.5 text-destructive" />
                      </Button>
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-3 font-mono">
                      {new Date(note.createdAt).toLocaleString('en-US', {
                        month: 'short', day: 'numeric', year: 'numeric',
                        hour: '2-digit', minute: '2-digit',
                      })}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* ── Enrichment ── */}
          <TabsContent value="enrichment" className="mt-5">
            {!enrichment ? (
              <>
                {/* NO_API_KEY: Setup card */}
                {enrichErrorCode === 'NO_API_KEY' ? (
                  <div className="bg-card border border-border rounded-xl p-6 space-y-5">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-amber-500/10 flex items-center justify-center shrink-0">
                        <Key className="h-5 w-5 text-amber-400" />
                      </div>
                      <div>
                        <h3 className="font-display font-bold text-base">API Key Required</h3>
                        <p className="text-sm text-muted-foreground">Configure Clearbit to enable real enrichment</p>
                      </div>
                    </div>
                    <div className="bg-muted/60 rounded-lg p-4 font-mono text-xs space-y-1.5 border border-border">
                      <p className="text-muted-foreground"># .env.local</p>
                      <p>
                        <span className="text-primary">VITE_CLEARBIT_API_KEY</span>
                        =<span className="text-emerald-400">sk-your-key-here</span>
                      </p>
                      <p>
                        <span className="text-primary">VITE_HUNTER_API_KEY</span>
                        =<span className="text-emerald-400">your-hunter-key-here</span>
                      </p>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Get a free Clearbit API key from the Clearbit developer dashboard.
                      The free tier supports up to 50 enrichments/month. Hunter.io is optional
                      — it adds email signal data on top of Clearbit.
                    </p>
                    <Button variant="outline" size="sm" onClick={handleEnrich} disabled={enriching}>
                      {enriching
                        ? <><Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />Trying…</>
                        : 'Try Again'}
                    </Button>
                  </div>
                ) : enrichError ? (
                  /* Other API errors */
                  <div className="bg-card border border-border rounded-xl p-8 flex flex-col items-center text-center gap-4">
                    <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${
                      enrichErrorCode === 'NOT_FOUND' ? 'bg-amber-500/10' : 'bg-destructive/10'
                    }`}>
                      <AlertCircle className={`h-6 w-6 ${
                        enrichErrorCode === 'NOT_FOUND' ? 'text-amber-400' : 'text-destructive'
                      }`} />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1.5">
                        {enrichErrorCode === 'NOT_FOUND' ? 'Domain Not Found'
                          : enrichErrorCode === 'RATE_LIMITED' ? 'Rate Limit Reached'
                          : enrichErrorCode === 'INVALID_API_KEY' ? 'Invalid API Key'
                          : 'Enrichment Failed'}
                      </h3>
                      <p className="text-sm text-muted-foreground max-w-sm">{enrichError}</p>
                    </div>
                    <Button variant="outline" size="sm" onClick={handleEnrich} disabled={enriching}>
                      {enriching
                        ? <><Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />Retrying…</>
                        : 'Try Again'}
                    </Button>
                  </div>
                ) : (
                  /* Default CTA */
                  <div className="text-center py-20 bg-card border border-border rounded-xl">
                    <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-5">
                      <Sparkles className="h-7 w-7 text-primary" />
                    </div>
                    <h3 className="font-display font-bold text-xl mb-2">Enrich this company</h3>
                    <p className="text-sm text-muted-foreground mb-8 max-w-sm mx-auto leading-relaxed">
                      Pull live data from Clearbit for{' '}
                      <span className="font-mono text-foreground">{company.domain}</span>{' '}
                      — tech stack, funding history, social profiles, and derived signals.
                    </p>
                    <Button onClick={handleEnrich} disabled={enriching} size="lg" className="min-w-[160px]">
                      {enriching ? (
                        <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Enriching…</>
                      ) : (
                        <><Sparkles className="h-4 w-4 mr-2" />Enrich Company</>
                      )}
                    </Button>
                  </div>
                )}
              </>
            ) : (
              <div className="space-y-4">
                {/* Toolbar */}
                <div className="flex items-center justify-between py-1">
                  <div className="flex items-center gap-3">
                    {enrichment.logoUrl && (
                      <img
                        src={enrichment.logoUrl}
                        alt={`${company.name} logo`}
                        className="h-6 w-6 rounded object-contain bg-white/5 border border-border p-0.5"
                      />
                    )}
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                      <span className="font-mono">
                        Enriched {new Date(enrichment.enrichedAt).toLocaleString('en-US', {
                          month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
                        })}
                      </span>
                      {enrichment.dataSource && (
                        <span className="px-1.5 py-0.5 rounded bg-muted border border-border text-[10px] uppercase tracking-widest font-semibold">
                          {enrichment.dataSource}
                        </span>
                      )}
                    </div>
                  </div>
                  <Button variant="outline" size="sm" onClick={handleEnrich} disabled={enriching}>
                    {enriching
                      ? <><Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />Refreshing…</>
                      : <><RefreshCw className="h-3.5 w-3.5 mr-1.5" />Refresh</>
                    }
                  </Button>
                </div>

                {/* Summary */}
                <section className="bg-card border border-border rounded-xl p-5">
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3 flex items-center gap-2">
                    <FileText className="h-3.5 w-3.5" /> Summary
                  </h3>
                  <p className="text-sm leading-relaxed text-secondary-foreground">{enrichment.summary}</p>
                </section>

                {/* What they do */}
                <section className="bg-card border border-border rounded-xl p-5">
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3 flex items-center gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5" /> What they do
                  </h3>
                  <ul className="space-y-2">
                    {enrichment.whatTheyDo.map((item, i) => (
                      <li key={i} className="text-sm flex items-start gap-2.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary mt-[5px] shrink-0" />
                        <span className="text-secondary-foreground leading-relaxed">{item}</span>
                      </li>
                    ))}
                  </ul>
                </section>

                {/* Tech Stack — only shown when Clearbit returns it */}
                {enrichment.techStack && enrichment.techStack.length > 0 && (
                  <section className="bg-card border border-border rounded-xl p-5">
                    <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3 flex items-center gap-2">
                      <Code2 className="h-3.5 w-3.5" /> Tech Stack
                      <span className="ml-auto font-mono text-[10px] normal-case tracking-normal text-muted-foreground">
                        {enrichment.techStack.length} technologies
                      </span>
                    </h3>
                    <div className="flex flex-wrap gap-1.5">
                      {enrichment.techStack.map((tech, i) => (
                        <Badge key={i} variant="secondary" className="text-xs font-mono">
                          {tech}
                        </Badge>
                      ))}
                    </div>
                  </section>
                )}

                {/* Social Profiles — only shown when Clearbit returns them */}
                {enrichment.socialProfiles &&
                  (enrichment.socialProfiles.linkedin || enrichment.socialProfiles.twitter || enrichment.socialProfiles.crunchbase) && (
                  <section className="bg-card border border-border rounded-xl p-5">
                    <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3 flex items-center gap-2">
                      <Link2 className="h-3.5 w-3.5" /> Social Profiles
                    </h3>
                    <div className="space-y-2.5">
                      {enrichment.socialProfiles.linkedin && (
                        <a
                          href={enrichment.socialProfiles.linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-sm text-primary hover:underline"
                        >
                          <ExternalLink className="h-3.5 w-3.5 shrink-0" />
                          LinkedIn
                          <span className="text-muted-foreground font-mono text-xs truncate">
                            {enrichment.socialProfiles.linkedin}
                          </span>
                        </a>
                      )}
                      {enrichment.socialProfiles.twitter && (
                        <a
                          href={enrichment.socialProfiles.twitter}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-sm text-primary hover:underline"
                        >
                          <ExternalLink className="h-3.5 w-3.5 shrink-0" />
                          Twitter / X
                          <span className="text-muted-foreground font-mono text-xs truncate">
                            {enrichment.socialProfiles.twitter}
                          </span>
                        </a>
                      )}
                      {enrichment.socialProfiles.crunchbase && (
                        <a
                          href={enrichment.socialProfiles.crunchbase}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-sm text-primary hover:underline"
                        >
                          <ExternalLink className="h-3.5 w-3.5 shrink-0" />
                          Crunchbase
                          <span className="text-muted-foreground font-mono text-xs truncate">
                            {enrichment.socialProfiles.crunchbase}
                          </span>
                        </a>
                      )}
                    </div>
                  </section>
                )}

                {/* Keywords */}
                <section className="bg-card border border-border rounded-xl p-5">
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3 flex items-center gap-2">
                    <Tag className="h-3.5 w-3.5" /> Keywords
                  </h3>
                  <div className="flex flex-wrap gap-1.5">
                    {enrichment.keywords.map((kw, i) => (
                      <Badge key={i} variant="secondary" className="text-xs font-normal">
                        {kw}
                      </Badge>
                    ))}
                  </div>
                </section>

                {/* Derived Signals */}
                <section className="bg-card border border-border rounded-xl p-5">
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3 flex items-center gap-2">
                    <Zap className="h-3.5 w-3.5" /> Derived Signals
                  </h3>
                  <div className="space-y-2.5">
                    {enrichment.signals.map((s, i) => (
                      <div key={i} className="flex items-center justify-between gap-3 py-2 border-b border-border last:border-0">
                        <span className="text-sm text-secondary-foreground">{s.signal}</span>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold shrink-0 ${confidenceStyle[s.confidence]}`}>
                          {s.confidence}
                        </span>
                      </div>
                    ))}
                  </div>
                </section>

                {/* Sources */}
                <section className="bg-card border border-border rounded-xl p-5">
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3 flex items-center gap-2">
                    <Globe className="h-3.5 w-3.5" /> Sources
                  </h3>
                  <div className="space-y-2">
                    {enrichment.sources.map((src, i) => (
                      <div key={i} className="flex items-center justify-between gap-3 py-1.5 border-b border-border last:border-0">
                        <a
                          href={src.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-primary hover:underline inline-flex items-center gap-1.5 min-w-0 truncate"
                        >
                          <ExternalLink className="h-3 w-3 shrink-0" />
                          <span className="truncate">{src.url}</span>
                        </a>
                        <span className="text-[11px] text-muted-foreground font-mono shrink-0">
                          {new Date(src.scrapedAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    ))}
                  </div>
                </section>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
