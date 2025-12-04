import { useState, useEffect } from "react";
import { Check, Clipboard } from "lucide-react";
import { Button } from "@/components/ui/button.tsx";
import { cn } from "@/lib/utils.ts";

type CopyButtonProps = {
  size?: "default" | "sm" | "lg" | "icon";
  variant?:
    | "default"
    | "destructive"
    | "link"
    | "outline"
    | "secondary"
    | "ghost";
  textToCopy: string;
  buttonText?: string;
  disabled?: boolean;
  className?: string;
};

const COPY_SUCCESS_DURATION_MS = 3000;

function CopyButton({
  size = "default",
  variant = "default",
  textToCopy,
  buttonText,
  disabled = false,
  className,
}: CopyButtonProps) {
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    if (!isCopied) {
      return;
    }

    const timerId = setTimeout(() => {
      setIsCopied(false);
    }, COPY_SUCCESS_DURATION_MS);

    return () => {
      clearTimeout(timerId);
    };
  }, [isCopied]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(textToCopy);
      setIsCopied(true);
    } catch (err) {
      console.error("Failed to copy to clipboard:", err);
    }
  };

  const Icon = isCopied ? Check : Clipboard;
  const displayText = buttonText ? (isCopied ? "Copied!" : buttonText) : null;

  return (
    <Button
      size={size}
      variant={variant}
      onClick={handleCopy}
      disabled={isCopied || disabled}
      title="Copy decklist to clipboard"
      className={cn(
        className,
        isCopied
          ? "bg-green-600 text-white disabled:!opacity-100"
          : "cursor-pointer",
      )}
    >
      <Icon />
      {displayText}
    </Button>
  );
}

export default CopyButton;
