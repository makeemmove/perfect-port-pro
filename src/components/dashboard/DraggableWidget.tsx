import { ChevronUp, ChevronDown } from 'lucide-react';
import type { ReactNode } from 'react';

interface DraggableWidgetProps {
  id: string;
  children: ReactNode;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
}

const DraggableWidget = ({ id, children, onMoveUp, onMoveDown }: DraggableWidgetProps) => {
  return (
    <div className="relative mb-2">
      <div className="absolute top-2 right-2 z-10 flex flex-col gap-1">
        {onMoveUp && (
          <button
            onClick={onMoveUp}
            className="w-7 h-7 rounded-full bg-accent/15 text-accent flex items-center justify-center hover:bg-accent/25 transition-colors duration-200"
            aria-label="Move up"
          >
            <ChevronUp size={16} />
          </button>
        )}
        {onMoveDown && (
          <button
            onClick={onMoveDown}
            className="w-7 h-7 rounded-full bg-accent/15 text-accent flex items-center justify-center hover:bg-accent/25 transition-colors duration-200"
            aria-label="Move down"
          >
            <ChevronDown size={16} />
          </button>
        )}
      </div>
      {children}
    </div>
  );
};

export default DraggableWidget;
