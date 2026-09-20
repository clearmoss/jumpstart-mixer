import { Button as ButtonPrimitive } from "@base-ui/react/button";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center rounded-lg border border-transparent bg-clip-padding text-sm font-medium whitespace-nowrap transition-all outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 active:not-aria-[haspopup]:translate-y-px disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default:
          "bg-orange-600 text-white hover:bg-orange-500 active:bg-orange-600/90",
        outline:
          "border-border bg-background hover:bg-muted hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground dark:border-input dark:bg-input/30 dark:hover:bg-input/50",
        secondary:
          "bg-primary text-card hover:bg-zinc-600 active:bg-black/90 dark:bg-primary dark:text-card dark:hover:bg-primary/90 dark:active:bg-white/90 aria-expanded:bg-black aria-expanded:text-white dark:aria-expanded:bg-white dark:aria-expanded:text-black",
        ghost:
          "hover:bg-muted hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground dark:hover:bg-muted/50",
        destructive:
          "bg-destructive/10 text-destructive hover:bg-destructive/20 focus-visible:border-destructive/40 focus-visible:ring-destructive/20 dark:bg-destructive/20 dark:hover:bg-destructive/30 dark:focus-visible:ring-destructive/40",
        link: "text-primary underline-offset-4 hover:underline",
        "mtg-white":
          "border-2 border-mtg-white-light bg-mtg-white text-black hover:brightness-110 active:brightness-95 focus-visible:border-mtg-white-light focus-visible:ring-mtg-white-light/50",
        "mtg-blue":
          "border-2 border-mtg-blue-light bg-mtg-blue text-white hover:brightness-110 active:brightness-95 focus-visible:border-mtg-blue-light focus-visible:ring-mtg-blue-light/50",
        "mtg-black":
          "border-2 border-mtg-black-light bg-mtg-black text-white hover:brightness-110 active:brightness-95 focus-visible:border-mtg-black-light focus-visible:ring-mtg-black-light/50",
        "mtg-red":
          "border-2 border-mtg-red-light bg-mtg-red text-white hover:brightness-110 active:brightness-95 focus-visible:border-mtg-red-light focus-visible:ring-mtg-red-light/50",
        "mtg-green":
          "border-2 border-mtg-green-light bg-mtg-green text-white hover:brightness-110 active:brightness-95 focus-visible:border-mtg-green-light focus-visible:ring-mtg-green-light/50",
        "mtg-colorless":
          "border-2 border-mtg-colorless-light bg-mtg-colorless text-black hover:brightness-110 active:brightness-95 focus-visible:border-mtg-colorless-light focus-visible:ring-mtg-colorless-light/50",
        none: "",
      },
      size: {
        default:
          "h-8 gap-1.5 px-2.5 has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2",
        xs: "h-6 gap-1 rounded-lg px-2 text-xs in-data-[slot=button-group]:rounded-lg has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3",
        sm: "h-7 gap-1 rounded-lg px-2.5 text-[0.8rem] in-data-[slot=button-group]:rounded-lg has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3.5",
        lg: "h-9 gap-1.5 px-2.5 has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2",
        icon: "size-8",
        "icon-xs":
          "size-6 rounded-lg in-data-[slot=button-group]:rounded-lg [&_svg:not([class*='size-'])]:size-3",
        "icon-sm": "size-7 rounded-lg in-data-[slot=button-group]:rounded-lg",
        "icon-lg": "size-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

type ButtonVariant = NonNullable<
  VariantProps<typeof buttonVariants>["variant"]
>;

function Button({
  className,
  variant = "default",
  size = "default",
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants, type ButtonVariant };
