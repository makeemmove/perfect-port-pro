import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { MapPin, DollarSign, ExternalLink } from 'lucide-react';

interface QuickViewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  location?: string;
  cost?: string;
  url?: string;
  category?: string;
}

const tagColors: Record<string, string> = {
  Library: 'bg-secondary/10 text-secondary',
  'Museum/Attraction': 'bg-amber-50 text-amber-600',
  Community: 'bg-emerald-50 text-emerald-600',
  'Arts & Culture': 'bg-orange-50 text-orange-600',
  'Park/Nature': 'bg-emerald-50 text-emerald-600',
  Portuguese: 'bg-red-50 text-red-600',
  Italian: 'bg-red-50 text-red-600',
  Seafood: 'bg-blue-50 text-blue-600',
  'Bakery/Coffee': 'bg-amber-50 text-amber-600',
  'Casual Dining': 'bg-slate-50 text-slate-600',
  Specialty: 'bg-violet-50 text-violet-600',
  Asian: 'bg-rose-50 text-rose-600',
  'Market/Specialty': 'bg-amber-50 text-amber-600',
};

const QuickViewModal = ({
  open,
  onOpenChange,
  title,
  description,
  location,
  cost,
  url,
  category,
}: QuickViewModalProps) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="max-w-md rounded-[20px] bg-card/95 backdrop-blur-[15px] shadow-glass-hover sm:rounded-[20px]">
      <DialogHeader>
        <DialogTitle className="text-lg font-bold text-foreground leading-tight pr-6">
          {title}
        </DialogTitle>
        {category && (
          <span
            className={`inline-block w-fit mt-1.5 text-[10px] font-semibold tracking-wide uppercase py-1 px-2.5 rounded-full ${tagColors[category] || 'bg-muted text-muted-foreground'}`}
          >
            {category}
          </span>
        )}
      </DialogHeader>

      <div className="space-y-4 mt-2">
        {description && (
          <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
        )}

        {location && (
          <div className="flex items-start gap-2 text-sm text-foreground">
            <MapPin className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" strokeWidth={2} />
            <span>{location}</span>
          </div>
        )}

        {cost && (
          <div className="flex items-center gap-2 text-sm text-foreground">
            <DollarSign className="w-4 h-4 text-muted-foreground flex-shrink-0" strokeWidth={2} />
            <span>{cost}</span>
          </div>
        )}

        {url && (
          <button
            onClick={() => window.open(url, '_blank', 'noopener,noreferrer')}
            className="w-full mt-2 flex items-center justify-center gap-2 py-3 px-4 rounded-full bg-foreground text-background text-sm font-semibold transition-all duration-300 ease-in-out hover:opacity-90 active:scale-[0.98]"
          >
            <ExternalLink className="w-4 h-4" strokeWidth={2} />
            Visit Website
          </button>
        )}
      </div>
    </DialogContent>
  </Dialog>
);

export default QuickViewModal;
