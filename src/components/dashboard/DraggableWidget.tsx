import { ChevronUp, ChevronDown, MoreVertical } from 'lucide-react';
import type { ReactNode } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface DraggableWidgetProps {
  id: string;
  children: ReactNode;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
}

const DraggableWidget = ({ id, children, onMoveUp, onMoveDown }: DraggableWidgetProps) => {
  return (
    <div className="relative mb-2">
      {(onMoveUp || onMoveDown) && (
        <div className="absolute top-2 right-2 z-10">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className="w-7 h-7 rounded-full bg-accent/10 text-muted-foreground flex items-center justify-center hover:bg-accent/20 transition-colors duration-200"
                aria-label="Reorder widget"
              >
                <MoreVertical size={16} />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-[140px]">
              {onMoveUp && (
                <DropdownMenuItem onClick={onMoveUp}>
                  <ChevronUp size={16} className="mr-2" />
                  Move Up
                </DropdownMenuItem>
              )}
              {onMoveDown && (
                <DropdownMenuItem onClick={onMoveDown}>
                  <ChevronDown size={16} className="mr-2" />
                  Move Down
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}
      {children}
    </div>
  );
};

export default DraggableWidget;
