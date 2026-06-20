import { type ReactNode } from "react";
import ColorSelector from "@/components/color-selector.tsx";
import SetSelector from "@/components/set-selector.tsx";
import CategoriesToggle from "@/components/categories-toggle.tsx";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion.tsx";
import { Settings } from "lucide-react";
import { cn } from "@/lib/utils.ts";

interface ControlPanelProps {
  settings?: ReactNode;
  actions?: ReactNode;
  className?: string;
}

function ControlPanelRoot({ settings, actions, className }: ControlPanelProps) {
  const cardClassName = "bg-card rounded-xl border p-4 sm:p-6";

  return (
    <div className={cn("flex flex-col gap-4", className)}>
      {/* mobile layout */}
      <div className="flex flex-col gap-2 sm:hidden">
        {settings && (
          <div className={cardClassName}>
            <Accordion>
              <AccordionItem value="item-1" className="border-none">
                <AccordionTrigger
                  className="flex cursor-pointer items-center gap-2 py-0 hover:no-underline"
                  data-testid="mobile-settings-trigger"
                >
                  <Settings size={20} className="text-muted-foreground" />
                  Settings
                </AccordionTrigger>
                <AccordionContent>
                  <div className="pt-4">{settings}</div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        )}
        {actions}
      </div>

      {/* desktop layout */}
      <div className="hidden flex-col sm:flex">
        <div className={cardClassName}>
          <div className="flex flex-col">
            {settings}
            {actions}
          </div>
        </div>
      </div>
    </div>
  );
}

interface ControlPanelSettingsProps {
  children?: ReactNode;
  showCategories?: boolean;
}

export function ControlPanelSettings({
  children,
  showCategories = true,
}: ControlPanelSettingsProps) {
  return (
    <>
      {/* desktop settings */}
      <div className="hidden flex-wrap items-center gap-4 sm:flex">
        <div className="flex gap-4">
          <ColorSelector />
          <SetSelector />
        </div>
        {showCategories && <CategoriesToggle />}
        {children}
      </div>

      {/* mobile settings (in accordion) */}
      <div className="flex flex-col gap-4 sm:hidden">
        <div className="flex flex-wrap items-center justify-center gap-4">
          <ColorSelector />
          <SetSelector />
        </div>
        {(showCategories || children) && (
          <div className="flex flex-col gap-4">
            {showCategories && <CategoriesToggle />}
            {children}
          </div>
        )}
      </div>
    </>
  );
}

interface ControlPanelActionsProps {
  children: ReactNode;
  className?: string;
}

export function ControlPanelActions({
  children,
  className,
}: ControlPanelActionsProps) {
  return (
    <>
      {/* desktop separator + actions */}
      <div className="hidden sm:block">
        <div className="bg-border my-4 h-px" />
        <div className={cn("flex flex-wrap items-center", className)}>
          {children}
        </div>
      </div>

      {/* mobile actions in a new card (outside accordion) */}
      <div className="sm:hidden">
        <div
          className={cn(
            "bg-card flex flex-col gap-4 rounded-xl border p-4",
            className,
          )}
        >
          {children}
        </div>
      </div>
    </>
  );
}

export const ControlPanel = Object.assign(ControlPanelRoot, {
  Settings: ControlPanelSettings,
  Actions: ControlPanelActions,
});

export default ControlPanel;
