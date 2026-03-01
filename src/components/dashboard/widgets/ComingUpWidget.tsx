import type { CityEvent } from '@/data/events';

interface ComingUpWidgetProps {
  upcomingEvents: CityEvent[];
}

const ComingUpWidget = ({ upcomingEvents }: ComingUpWidgetProps) => (
  <>
    <div className="flex items-center gap-3 text-[10px] font-semibold tracking-widest uppercase text-muted-foreground mt-2
                    before:flex-1 before:h-px before:bg-border
                    after:flex-1 after:h-px after:bg-border">
      ⚡ Coming Up
    </div>
    <div className="flex flex-col gap-2 pb-4">
      {upcomingEvents.map((e, i) => {
        const d = new Date(e.date);
        return (
          <div key={i} className="flex items-center gap-3 py-2.5 px-3.5 rounded-xl bg-card border border-border shadow-card hover:shadow-card-hover transition-shadow">
            <div className="w-2 h-2 rounded-full flex-shrink-0 bg-secondary" />
            <div className="text-[13px] font-medium flex-1 whitespace-nowrap overflow-hidden text-ellipsis text-foreground">{e.name}</div>
            <div className="mono text-[10px] text-muted-foreground flex-shrink-0">
              {d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </div>
          </div>
        );
      })}
    </div>
  </>
);

export default ComingUpWidget;
