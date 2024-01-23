import { cn } from "@/lib/utils";
import {
  BetterMentionsMenuItemProps,
  BetterMentionsMenuProps,
} from "lexical-better-mentions";
import { forwardRef } from "react";

/**
 * Menu component for the BetterMentionsPlugin.
 */
export const Menu = forwardRef<any, BetterMentionsMenuProps>(
  ({ open, loading, ...other }, ref) => {
    if (loading) {
      return (
        <div
          ref={ref}
          className="top-[2px] m-0 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-2.5 text-sm text-popover-foreground shadow-md"
        >
          Loading...
        </div>
      );
    }
    return (
      <ul
        ref={ref}
        style={{
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        }}
        className="absolute top-[2px] m-0 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md"
        {...other}
      />
    );
  },
);
Menu.displayName = "Menu";

/**
 * MenuItem component for the BetterMentionsPlugin.
 */
export const MenuItem = forwardRef<HTMLLIElement, BetterMentionsMenuItemProps>(
  ({ selected, item, ...props }, ref) => (
    <li
      ref={ref}
      className={cn(
        "relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none",
        selected && "bg-accent text-accent-foreground",
      )}
      {...props}
    />
  ),
);
MenuItem.displayName = "MenuItem";
