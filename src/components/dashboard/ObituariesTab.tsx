import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ArrowUpRight, Heart, Search, Upload } from 'lucide-react';

/** From local_obituaries (scraped) or merged tribute (user submission) */
interface Obituary {
  id: string;
  full_name: string;
  obituary_url?: string | null;
  date_of_passing: string | null;
  birth_date?: string | null;
  picture_url?: string | null;
  article_bio?: string | null;
  _isTribute?: boolean;
}

function getYear(dateStr: string | null | undefined): string | null {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return null;
  return String(d.getFullYear());
}

function formatFullDate(dateStr: string | null | undefined): string | null {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return null;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

/** Short form: "1942 – 2024" or "† 2024" */
function getLifeDatesShort(obit: Obituary): string | null {
  const birthYear = getYear(obit.birth_date);
  const passingYear = getYear(obit.date_of_passing);
  if (birthYear && passingYear) return `${birthYear} – ${passingYear}`;
  if (!birthYear && passingYear) return `† ${passingYear}`;
  if (birthYear && !passingYear) return `${birthYear} –`;
  if (obit.date_of_passing) {
    const full = formatFullDate(obit.date_of_passing);
    if (full) return `† ${full}`;
  }
  return null;
}

/** Full life date line: "March 15, 1942 – January 3, 2024" when both dates exist */
function getLifeDatesFull(obit: Obituary): string | null {
  const birth = formatFullDate(obit.birth_date);
  const passing = formatFullDate(obit.date_of_passing);
  if (birth && passing) return `${birth} – ${passing}`;
  return getLifeDatesShort(obit);
}

function getSnippet(text: string, max = 160): string {
  const clean = text.trim();
  if (clean.length <= max) return clean;
  const cut = clean.slice(0, max);
  const lastSpace = cut.lastIndexOf(' ');
  return (lastSpace > 50 ? cut.slice(0, lastSpace) : cut).trim();
}

/** Card with optional photo; link only when obituary_url present (scraped); tributes are non-clickable */
function ObituaryCard({
  obit,
  lifeDatesFull,
  descriptionSnippet,
  hasDescription,
}: {
  obit: Obituary;
  lifeDatesFull: string | null;
  descriptionSnippet: string;
  hasDescription: boolean;
}) {
  const [imageError, setImageError] = useState(false);
  const showImage = obit.picture_url && !imageError;
  const isTribute = obit._isTribute || !obit.obituary_url;
  const className =
    'group block rounded-2xl overflow-hidden bg-white border border-stone-200/80 shadow-sm hover:shadow-md hover:border-stone-300/80 transition-all duration-200';

  const content = (
    <>
      {showImage ? (
        <div className="aspect-[16/10] bg-stone-100 overflow-hidden">
          <img
            src={obit.picture_url!}
            alt=""
            className="w-full h-full object-cover object-center group-hover:scale-[1.02] transition-transform duration-300"
            onError={() => setImageError(true)}
          />
        </div>
      ) : (
        <div className="h-1 w-full bg-gradient-to-r from-rose-100 via-stone-100 to-rose-50" aria-hidden />
      )}

      <div className="p-4 flex flex-col min-h-0">
        <h2
          className="text-[17px] font-semibold tracking-tight text-stone-800 leading-snug mb-2 group-hover:text-stone-900"
          style={{ fontFamily: 'Georgia, serif' }}
        >
          {obit.full_name}
        </h2>

        {lifeDatesFull && (
          <div className="mb-3">
            <span className="text-[11px] font-medium uppercase tracking-wider text-stone-400 block mb-0.5">
              Life
            </span>
            <p className="text-[14px] font-medium text-stone-600 leading-snug">
              {lifeDatesFull}
            </p>
          </div>
        )}

        {hasDescription && (
          <p className="text-[13px] text-stone-500 leading-relaxed line-clamp-3 flex-1">
            {descriptionSnippet}
          </p>
        )}

        {!isTribute && (
          <span className="mt-3 inline-flex items-center gap-1 text-[12px] font-medium text-stone-500 group-hover:text-rose-600 transition-colors">
            Read full obituary
            <ArrowUpRight className="w-3.5 h-3.5" />
          </span>
        )}
      </div>
    </>
  );

  if (!isTribute && obit.obituary_url) {
    return (
      <a href={obit.obituary_url} target="_blank" rel="noopener noreferrer" className={className}>
        {content}
      </a>
    );
  }
  return <div className={className}>{content}</div>;
}

const BUCKET = 'tribute-photos';
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

const ObituariesTab = ({ onBackToHome }: { onBackToHome?: () => void }) => {
  const [obituaries, setObituaries] = useState<Obituary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [query, setQuery] = useState('');

  // Post Tribute form
  const [formOpen, setFormOpen] = useState(false);
  const [fullName, setFullName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [passingDate, setPassingDate] = useState('');
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [obituaryBio, setObituaryBio] = useState('');
  const [submitterName, setSubmitterName] = useState('');
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitMessage, setSubmitMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const loadObituaries = async () => {
    const now = new Date();
    const day = now.getDay();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - day);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    const weekStartIso = weekStart.toISOString().slice(0, 10);
    const weekEndIso = weekEnd.toISOString().slice(0, 10);

    const { data, error } = await supabase
      .from('local_obituaries')
      .select('*')
      .eq('city', 'Fall River')
      .gte('date_of_passing', weekStartIso)
      .lte('date_of_passing', weekEndIso)
      .order('date_of_passing', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(200);

    if (!error && data) {
      const list = data as unknown as Obituary[];
      const { data: tributes } = await (supabase as any)
        .from('tribute_submissions')
        .select('*')
        .eq('city', 'Fall River')
        .eq('status', 'approved')
        .order('passing_date', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(100);

      const tributeItems: Obituary[] = (tributes || []).map((t: any) => ({
        id: t.id,
        full_name: t.full_name,
        obituary_url: null,
        date_of_passing: t.passing_date,
        birth_date: t.birth_date,
        picture_url: t.picture_url,
        article_bio: t.article_bio,
        _isTribute: true,
      }));
      const merged = [...list, ...tributeItems].sort((a, b) => {
        const da = a.date_of_passing || '';
        const db = b.date_of_passing || '';
        return db.localeCompare(da);
      });
      setObituaries(merged);
    }
  };

  useEffect(() => {
    async function load() {
      setIsLoading(true);
      await loadObituaries();
      setIsLoading(false);
    }
    load();
  }, []);

  const normalizedQuery = query.trim().toLowerCase();
  const filtered = normalizedQuery
    ? obituaries.filter(o => (o.full_name || '').toLowerCase().includes(normalizedQuery))
    : obituaries;

  const handleSearch = () => {
    if (!normalizedQuery) return;
    const exact = obituaries.find(o => (o.full_name || '').toLowerCase() === normalizedQuery);
    const first = exact || filtered[0];
    if (first?.obituary_url) {
      window.open(first.obituary_url, '_blank', 'noopener,noreferrer');
    }
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      setPhotoFile(null);
      setPhotoPreview(null);
      return;
    }
    if (!ALLOWED_TYPES.includes(file.type) || file.size > MAX_FILE_SIZE) {
      setSubmitMessage({ type: 'error', text: 'Please choose a JPEG, PNG, WebP or GIF under 5MB.' });
      return;
    }
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
    setSubmitMessage(null);
  };

  const resetForm = () => {
    setFullName('');
    setBirthDate('');
    setPassingDate('');
    setPhotoFile(null);
    if (photoPreview) URL.revokeObjectURL(photoPreview);
    setPhotoPreview(null);
    setObituaryBio('');
    setSubmitterName('');
    setSubmitMessage(null);
  };

  const handleCloseForm = () => {
    setFormOpen(false);
    resetForm();
  };

  const handleSubmitTribute = async (e: React.FormEvent) => {
    e.preventDefault();
    const name = fullName.trim();
    if (!name) {
      setSubmitMessage({ type: 'error', text: 'Please enter the full name of your loved one.' });
      return;
    }
    setSubmitLoading(true);
    setSubmitMessage(null);
    try {
      let pictureUrl: string | null = null;
      if (photoFile) {
        const ext = photoFile.name.split('.').pop() || 'jpg';
        const path = `${crypto.randomUUID()}.${ext}`;
        const { error: uploadError } = await supabase.storage.from(BUCKET).upload(path, photoFile, {
          contentType: photoFile.type,
          upsert: false,
        });
        if (uploadError) throw uploadError;
        const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(path);
        pictureUrl = urlData.publicUrl;
      }
      const { error } = await supabase.from('tribute_submissions').insert({
        full_name: name,
        birth_date: birthDate || null,
        passing_date: passingDate || null,
        picture_url: pictureUrl,
        article_bio: obituaryBio.trim() || null,
        submitter_name: submitterName.trim() || null,
        status: 'pending_approval',
        city: 'Fall River',
      });
      if (error) throw error;
      setSubmitMessage({
        type: 'success',
        text: 'Thank you. Your tribute has been submitted and is pending approval.',
      });
      setTimeout(() => {
        handleCloseForm();
      }, 2000);
    } catch (err: any) {
      setSubmitMessage({
        type: 'error',
        text: err?.message || 'Something went wrong. Please try again.',
      });
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <div className="space-y-6 pb-6">
      {/* Header */}
      <div className="text-center pt-1 pb-2">
        {onBackToHome && (
          <button
            onClick={onBackToHome}
            className="text-[11px] font-semibold text-stone-500 hover:text-stone-800 mb-2 block"
          >
            ← Back to Home
          </button>
        )}
        <div className="flex items-center justify-center gap-2 mb-1">
          <Heart className="w-5 h-5 text-rose-400" strokeWidth={1.5} />
          <h1 className="text-[24px] font-semibold tracking-tight text-stone-800" style={{ fontFamily: 'Georgia, serif' }}>
            Obituaries
          </h1>
        </div>
        <p className="text-[13px] text-stone-500 mb-4">Fall River · In memoriam</p>

        {obituaries.length > 0 && (
          <button
            type="button"
            onClick={() => setFormOpen(true)}
            className="w-full max-w-sm mx-auto flex items-center justify-center gap-2 rounded-xl border border-stone-300 bg-white px-5 py-3 text-[14px] font-semibold text-stone-900 shadow-sm hover:bg-stone-50 hover:border-stone-400 transition-colors"
          >
            Post a Tribute
          </button>
        )}
      </div>

      {/* Post Tribute form modal */}
      <Dialog open={formOpen} onOpenChange={(open) => !open && handleCloseForm()}>
        <DialogContent className="bg-white border border-stone-200 rounded-2xl shadow-xl max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-stone-900 font-semibold" style={{ fontFamily: 'Georgia, serif' }}>
              Post a Tribute
            </DialogTitle>
            <DialogDescription className="text-stone-500">
              Honor a loved one. Submissions are reviewed before being published.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmitTribute} className="space-y-4">
            <div>
              <label className="block text-[12px] font-medium text-stone-600 mb-1.5">Full Name of Loved One *</label>
              <Input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Full name"
                className="rounded-lg border-stone-300 bg-white text-stone-900 placeholder:text-stone-400"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[12px] font-medium text-stone-600 mb-1.5">Birth Date</label>
                <Input
                  type="date"
                  value={birthDate}
                  onChange={(e) => setBirthDate(e.target.value)}
                  className="rounded-lg border-stone-300 bg-white text-stone-900"
                />
              </div>
              <div>
                <label className="block text-[12px] font-medium text-stone-600 mb-1.5">Passing Date</label>
                <Input
                  type="date"
                  value={passingDate}
                  onChange={(e) => setPassingDate(e.target.value)}
                  className="rounded-lg border-stone-300 bg-white text-stone-900"
                />
              </div>
            </div>
            <div>
              <label className="block text-[12px] font-medium text-stone-600 mb-1.5">Photo</label>
              <div className="flex items-center gap-4">
                <label className="flex-shrink-0 w-24 h-24 rounded-[1rem] border-2 border-dashed border-stone-300 bg-stone-50 flex items-center justify-center cursor-pointer overflow-hidden hover:bg-stone-100 transition-colors">
                  <input
                    type="file"
                    accept={ALLOWED_TYPES.join(',')}
                    className="sr-only"
                    onChange={handlePhotoChange}
                  />
                  {photoPreview ? (
                    <img src={photoPreview} alt="" className="w-full h-full object-cover rounded-[1rem]" />
                  ) : (
                    <Upload className="w-7 h-7 text-stone-400" />
                  )}
                </label>
                <span className="text-[12px] text-stone-500">JPEG, PNG, WebP or GIF, max 5MB</span>
              </div>
            </div>
            <div>
              <label className="block text-[12px] font-medium text-stone-600 mb-1.5">Obituary / Bio</label>
              <Textarea
                value={obituaryBio}
                onChange={(e) => setObituaryBio(e.target.value)}
                placeholder="A short description or tribute…"
                rows={4}
                className="rounded-lg border-stone-300 bg-white text-stone-900 placeholder:text-stone-400 resize-none"
              />
            </div>
            <div>
              <label className="block text-[12px] font-medium text-stone-600 mb-1.5">Your Name (optional)</label>
              <Input
                value={submitterName}
                onChange={(e) => setSubmitterName(e.target.value)}
                placeholder="Who is posting this tribute"
                className="rounded-lg border-stone-300 bg-white text-stone-900 placeholder:text-stone-400"
              />
            </div>
            {submitMessage && (
              <p
                className={
                  submitMessage.type === 'success'
                    ? 'text-[13px] text-green-700'
                    : 'text-[13px] text-red-600'
                }
              >
                {submitMessage.text}
              </p>
            )}
            <DialogFooter className="gap-2 sm:gap-0">
              <button
                type="button"
                onClick={handleCloseForm}
                className="rounded-xl border border-stone-300 bg-white px-4 py-2.5 text-[14px] font-medium text-stone-700 hover:bg-stone-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitLoading}
                className="rounded-xl bg-stone-900 text-white px-5 py-2.5 text-[14px] font-semibold shadow-sm hover:bg-stone-800 disabled:opacity-60 transition-colors"
              >
                {submitLoading ? 'Submitting…' : 'Post Tribute'}
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Search */}
      <div className="flex items-center gap-2 rounded-2xl bg-stone-50 border border-stone-200/80 px-4 py-2.5 shadow-sm">
        <Search className="w-4 h-4 text-stone-400 flex-shrink-0" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') handleSearch(); }}
          placeholder="Search by name…"
          className="flex-1 bg-transparent outline-none text-[14px] text-stone-800 placeholder:text-stone-400"
          aria-label="Search obituaries by name"
        />
        <button
          type="button"
          onClick={handleSearch}
          className="px-4 py-2 rounded-xl text-[12px] font-semibold bg-stone-800 text-white active:scale-[0.98] transition shadow-sm"
        >
          Search
        </button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-44 w-full rounded-2xl" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        obituaries.length === 0 ? (
          <div
            className="rounded-2xl border border-stone-200 bg-white p-8 text-center shadow-sm"
            style={{ borderColor: 'rgb(231 229 228)' }}
          >
            <p className="text-[15px] text-stone-600 mb-4">No Obituaries yet? Be the first to honor a loved one.</p>
            <button
              type="button"
              onClick={() => setFormOpen(true)}
              className="rounded-xl bg-stone-900 text-white px-5 py-2.5 text-[14px] font-semibold shadow-sm hover:bg-stone-800 transition-colors"
            >
              Post a Tribute
            </button>
          </div>
        ) : (
          <div className="text-center py-16 text-[14px] text-stone-500">
            No matches found.
          </div>
        )
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((obit) => {
            const lifeDatesFull = getLifeDatesFull(obit);
            const raw = obit as any;
            const description: string =
              raw.article_bio ||
              raw.article ||
              raw.bio ||
              raw.Article_Bio ||
              raw['Article/Bio'] ||
              '';
            const hasDescription = Boolean(description && description.trim().length > 0);
            const snippet = hasDescription ? getSnippet(description) + (description.trim().length > 160 ? '…' : '') : '';

            return (
              <ObituaryCard
                key={obit.id}
                obit={obit}
                lifeDatesFull={lifeDatesFull}
                descriptionSnippet={snippet}
                hasDescription={hasDescription}
              />
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ObituariesTab;

