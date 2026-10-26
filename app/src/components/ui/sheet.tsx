import * as React from "react"
import { Drawer as DrawerPrimitive } from "vaul"
import { cn } from "@/lib/utils"

const Sheet = ({
  open,
  onOpenChange,
  shouldScaleBackground = false,
  repositionInputs = false,
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Root>) => {
  const hasPushedHistoryRef = React.useRef(false);

  React.useEffect(() => {
    if (open) {
      window.history.pushState({ sheetOpen: true }, '');
      hasPushedHistoryRef.current = true;

      const handlePopState = () => {
        hasPushedHistoryRef.current = false;
        onOpenChange?.(false);
      };

      window.addEventListener('popstate', handlePopState);
      return () => {
        window.removeEventListener('popstate', handlePopState);
        if (hasPushedHistoryRef.current) {
          hasPushedHistoryRef.current = false;
          window.history.back();
        }
      };
    }
  }, [open, onOpenChange]);

  return (
    <DrawerPrimitive.Root
      open={open}
      onOpenChange={onOpenChange}
      shouldScaleBackground={shouldScaleBackground}
      repositionInputs={repositionInputs}
      {...props}
    />
  );
};
Sheet.displayName = "Sheet"

const SheetTrigger = DrawerPrimitive.Trigger
const SheetPortal = DrawerPrimitive.Portal
const SheetClose = DrawerPrimitive.Close

const SheetOverlay = React.forwardRef<
  React.ElementRef<typeof DrawerPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DrawerPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DrawerPrimitive.Overlay
    ref={ref}
    className={cn("fixed inset-0 z-50 bg-black/70 backdrop-blur-sm", className)}
    {...props}
  />
))
SheetOverlay.displayName = DrawerPrimitive.Overlay.displayName

const SheetContent = React.forwardRef<
  React.ElementRef<typeof DrawerPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DrawerPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <SheetPortal>
    <SheetOverlay />
    <DrawerPrimitive.Content
      ref={ref}
      className={cn(
        "fixed inset-x-0 bottom-0 z-50 mt-24 flex h-auto max-h-[85vh] flex-col rounded-t-[24px] border-t border-zinc-800 bg-[#121215] p-5 shadow-2xl focus:outline-none",
        className
      )}
      {...props}
    >
      <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-zinc-700/60" />
      {children}
    </DrawerPrimitive.Content>
  </SheetPortal>
))
SheetContent.displayName = "SheetContent"

const SheetHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn("grid gap-1.5 p-2 text-center sm:text-left", className)}
    {...props}
  />
)
SheetHeader.displayName = "SheetHeader"

const SheetTitle = React.forwardRef<
  React.ElementRef<typeof DrawerPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DrawerPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DrawerPrimitive.Title
    ref={ref}
    className={cn(
      "text-base font-semibold leading-none tracking-tight text-zinc-100",
      className
    )}
    {...props}
  />
))
SheetTitle.displayName = DrawerPrimitive.Title.displayName

export {
  Sheet,
  SheetPortal,
  SheetOverlay,
  SheetTrigger,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
}
