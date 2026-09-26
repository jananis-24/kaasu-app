import {
  type Announcements,
  closestCenter,
  DndContext,
  type DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core"
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { GripVertical, Lock } from "lucide-react"
import { Link, useLocation } from "react-router"
import { CategoryTile } from "@/components/CategoryTile"
import { cn } from "@/lib/utils"
import { reorderCategories } from "./actions"
import type { Category } from "./schema"

const entries = (count: number) => (count === 1 ? "1 entry" : `${count} entries`)

type Props = { categories: Category[]; counts: Map<number, number> }

/** Category rows with a drag handle (mouse, touch or keyboard: Space, arrows, Space). */
export function CategoryList({ categories, counts }: Props) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  // Screen reader messages with category names instead of "item 2"
  const name = (id: string | number | undefined) =>
    categories.find((c) => c.id === Number(id))?.name
  const announcements: Announcements = {
    onDragStart: ({ active }) => `Picked up ${name(active.id)}.`,
    onDragOver: ({ active, over }) =>
      over ? `${name(active.id)} moved to where ${name(over.id)} was.` : undefined,
    onDragEnd: ({ active, over }) => `${name(active.id)} dropped.${over ? " Order saved." : ""}`,
    onDragCancel: ({ active }) => `Moving ${name(active.id)} cancelled.`,
  }

  const onDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) return
    const ids = categories.map((c) => c.id)
    reorderCategories(arrayMove(ids, ids.indexOf(Number(active.id)), ids.indexOf(Number(over.id))))
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={onDragEnd}
      accessibility={{ announcements }}
    >
      <SortableContext items={categories.map((c) => c.id)} strategy={verticalListSortingStrategy}>
        {categories.map((category, index) => (
          <Row
            key={category.id}
            category={category}
            count={counts.get(category.id) ?? 0}
            first={index === 0}
          />
        ))}
      </SortableContext>
    </DndContext>
  )
}

function Row({ category, count, first }: { category: Category; count: number; first: boolean }) {
  const location = useLocation()
  const params = new URLSearchParams(location.search)
  params.set("editCategory", String(category.id))
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: category.id })

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Translate.toString(transform), transition }}
      className={cn(
        "relative box-content flex min-h-14 items-center gap-1.5 border-divider border-t",
        first && "border-t-0",
        isDragging && "z-10 rounded-md bg-surface shadow-dialog",
      )}
    >
      <button
        ref={setActivatorNodeRef}
        type="button"
        aria-label={`Reorder ${category.name}`}
        className="flex size-tap shrink-0 cursor-grab touch-none items-center justify-center text-fg-muted active:cursor-grabbing"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="size-[18px]" strokeWidth={2.4} aria-hidden />
      </button>
      <Link
        to={{ search: params.toString() }}
        aria-label={`${category.name}, ${entries(count)}${category.permanent ? ", permanent" : ""}. Edit`}
        className="flex min-h-13 grow items-center gap-3"
      >
        <CategoryTile
          category={category}
          className="size-[38px] rounded-[13px]"
          iconClassName="size-[19px]"
        />
        <span className="grow font-semibold">{category.name}</span>
        {category.permanent && (
          <Lock className="size-3.5 text-fg-muted" strokeWidth={2.2} aria-hidden />
        )}
        <span className="num text-fg-muted text-sm">{entries(count)}</span>
      </Link>
    </div>
  )
}
