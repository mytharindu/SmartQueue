import * as Primitive from "@radix-ui/react-alert-dialog";
import { cn } from "@/lib/utils";

export function AlertDialog(props) {
  return <Primitive.Root {...props} />;
}

export function AlertDialogTrigger(props) {
  return <Primitive.Trigger {...props} />;
}

export function AlertDialogPortal(props) {
  return <Primitive.Portal {...props} />;
}

export function AlertDialogOverlay({ className, ...props }) {
  return (
    <Primitive.Overlay
      className={cn(
        "fixed inset-0 z-50 bg-foreground/30 backdrop-blur-sm",
        "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0",
        className,
      )}
      {...props}
    />
  );
}

export function AlertDialogContent({ className, children, ...props }) {
  return (
    <Primitive.Portal>
      <AlertDialogOverlay />
      <Primitive.Content
        className={cn(
          "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4",
          "rounded-xl border border-border bg-card p-6 shadow-glow",
          "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0",
          "data-[state=open]:zoom-in-95 data-[state=closed]:zoom-out-95",
          className,
        )}
        {...props}
      >
        {children}
      </Primitive.Content>
    </Primitive.Portal>
  );
}

export function AlertDialogHeader({ className, ...props }) {
  return <div className={cn("flex flex-col gap-1", className)} {...props} />;
}

export function AlertDialogFooter({ className, ...props }) {
  return (
    <div
      className={cn(
        "flex flex-col-reverse gap-2 sm:flex-row sm:justify-end sm:gap-2",
        className,
      )}
      {...props}
    />
  );
}

export function AlertDialogTitle({ className, ...props }) {
  return (
    <Primitive.Title
      className={cn("font-display text-lg font-semibold", className)}
      {...props}
    />
  );
}

export function AlertDialogDescription({ className, ...props }) {
  return (
    <Primitive.Description
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  );
}

export function AlertDialogAction({ className, ...props }) {
  return (
    <Primitive.Action
      className={cn(
        "inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90",
        className,
      )}
      {...props}
    />
  );
}

export function AlertDialogCancel({ className, ...props }) {
  return (
    <Primitive.Cancel
      className={cn(
        "inline-flex h-10 items-center justify-center rounded-md border border-input bg-background px-4 text-sm font-medium hover:bg-muted",
        className,
      )}
      {...props}
    />
  );
}