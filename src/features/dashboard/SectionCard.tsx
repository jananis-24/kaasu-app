import type { ReactNode } from "react"
import { cn } from "@/lib/utils"

type Props = {
  id: string
  title: string
  /** Small grey text on the right of the title ("Tap for details") */
  aside?: ReactNode
  className?: string
  headerClassName?: string
  children: ReactNode
}

/** Glass card with a heading row, used by every dashboard section. */
export function SectionCard({ id, title, aside, className, headerClassName, children }: Props) {
  return (
    <section aria-labelledby={id} className={cn("glass flex flex-col rounded-xl", className)}>
      <div className={cn("flex items-baseline justify-between gap-2", headerClassName)}>
        <h2 id={id} className="text-lg lg:text-[19px]">
          {title}
        </h2>
        {aside && <span className="text-fg-muted text-sm">{aside}</span>}
      </div>
      {children}
    </section>
  )
}
