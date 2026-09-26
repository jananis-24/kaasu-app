import { Toaster as Sonner, type ToasterProps } from "sonner"

/**
 * Toasts as drawn on the TxToast / CatToast boards: dark "action" pill, bold Undo link.
 * Show one with: toast("Transaction deleted", { action: { label: "Undo", onClick } })
 */
const Toaster = (props: ToasterProps) => (
  <Sonner
    position="bottom-center"
    offset={{ bottom: 32 }}
    mobileOffset={{ bottom: 94, left: 16, right: 16 }}
    toastOptions={{
      unstyled: true,
      classNames: {
        toast:
          "flex w-full min-h-13 items-center justify-between gap-3 rounded-[18px] bg-action py-1 pr-1 pl-[18px] font-body text-on-action shadow-toast lg:w-[360px]",
        title: "font-semibold text-base",
        actionButton:
          "h-tap shrink-0 rounded-md bg-transparent px-4 font-extrabold text-base text-on-action underline underline-offset-3",
      },
    }}
    {...props}
  />
)

export { Toaster }
