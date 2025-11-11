import { DragEvent, ReactNode } from 'react';

interface DragDropCardProps<T> {
  item: T;
  getId: (item: T) => string;
  render: (item: T) => ReactNode;
  onDragStart?: (item: T) => void;
  onDrop?: (item: T) => void;
}

export default function DragDropCard<T>({ item, getId, render, onDragStart, onDrop }: DragDropCardProps<T>) {
  const handleDragStart = (event: DragEvent<HTMLDivElement>) => {
    const id = getId(item);
    event.dataTransfer.setData('text/plain', id);
    onDragStart?.(item);
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    onDrop?.(item);
  };

  return (
    <div
      className="card"
      draggable
      onDragStart={handleDragStart}
      onDragOver={(event) => event.preventDefault()}
      onDrop={handleDrop}
      style={{ cursor: 'grab' }}
    >
      {render(item)}
    </div>
  );
}
