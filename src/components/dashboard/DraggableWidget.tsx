import type { ReactNode } from 'react';

interface DraggableWidgetProps {
  id: string;
  children: ReactNode;
}

const DraggableWidget = ({ id, children }: DraggableWidgetProps) => {
  return <div className="mb-2">{children}</div>;
};

export default DraggableWidget;
