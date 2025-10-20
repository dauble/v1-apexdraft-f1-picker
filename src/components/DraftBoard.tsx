import * as React from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useDraftStore } from '@/hooks/useDraftStore';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import { SortableDriverItem } from './SortableDriverItem';
import { Button } from './ui/button';
import { Trash2 } from 'lucide-react';
interface DraftBoardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}
export function DraftBoard({ open, onOpenChange }: DraftBoardProps) {
  const draftedDrivers = useDraftStore((s) => s.draftedDrivers);
  const removeDriver = useDraftStore((s) => s.removeDriver);
  const reorderDrivers = useDraftStore((s) => s.reorderDrivers);
  const clearDraft = useDraftStore((s) => s.clearDraft);
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );
  const handleRemove = (driverId: number, driverName: string) => {
    removeDriver(driverId);
    toast.error(`${driverName} removed from draft board.`, {
      style: {
        background: 'hsl(var(--background))',
        color: 'hsl(var(--destructive))',
        border: '1px solid hsl(var(--destructive))',
        fontFamily: 'Inter, sans-serif',
      },
    });
  };
  const handleClearDraft = () => {
    clearDraft();
    toast.info('Draft board has been cleared.', {
      style: {
        background: 'hsl(var(--background))',
        color: 'hsl(var(--foreground))',
        border: '1px solid hsl(var(--border))',
        fontFamily: 'Inter, sans-serif',
      },
    });
  };
  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = draftedDrivers.findIndex((d) => d.id === active.id);
      const newIndex = draftedDrivers.findIndex((d) => d.id === over.id);
      reorderDrivers(oldIndex, newIndex);
    }
  }
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="bg-background border-l border-primary text-primary-foreground font-sans p-0 w-full sm:max-w-md">
        <div className="flex flex-col h-full">
          <SheetHeader className="p-6 border-b border-border">
            <div className="flex justify-between items-center">
              <div>
                <SheetTitle className="text-3xl text-primary">DRAFT BOARD</SheetTitle>
                <SheetDescription className="text-muted-foreground">
                  Your selected drivers. Drag to reorder.
                </SheetDescription>
              </div>
              {draftedDrivers.length > 0 && (
                <Button variant="destructive" size="sm" onClick={handleClearDraft}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Clear
                </Button>
              )}
            </div>
          </SheetHeader>
          <ScrollArea className="flex-1">
            <div className="p-6">
              {draftedDrivers.length === 0 ? (
                <div className="text-center text-muted-foreground py-10">
                  <p>NO DRIVERS DRAFTED</p>
                  <p className="text-xs mt-2">ADD DRIVERS FROM THE DASHBOARD</p>
                </div>
              ) : (
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext items={draftedDrivers} strategy={verticalListSortingStrategy}>
                    <ul className="space-y-4">
                      {draftedDrivers.map((driver) => (
                        <SortableDriverItem key={driver.id} driver={driver} onRemove={handleRemove} />
                      ))}
                    </ul>
                  </SortableContext>
                </DndContext>
              )}
            </div>
          </ScrollArea>
        </div>
      </SheetContent>
    </Sheet>
  );
}