import { useState } from "react";
import { Check, Clipboard } from "lucide-react";
import { Button } from "@/components/ui/button.tsx";

function CopyButton({
  size = "default",
  variant = "default",
  textToCopy,
  buttonText,
  disabled = false,
}: {
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
}) {
  const [isCopied, setIsCopied] = useState(false);

  const copyToClipboard = async () => {
    if (isCopied) {
      return;
    }
    try {
      await navigator.clipboard.writeText(textToCopy);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 3000); // reset icon
    } catch (err) {
      console.error("Failed to copy to clipboard:", err);
    }
  };

  return (
    <Button
      size={size}
      variant={variant}
      onClick={copyToClipboard}
      disabled={isCopied || disabled}
      title="Copy decklist to clipboard"
      className={
        isCopied
          ? "bg-green-600 text-white disabled:!opacity-100"
          : "cursor-pointer"
      }
    >
      {isCopied ? <Check /> : <Clipboard />}
      {buttonText && (isCopied ? "Copied!" : buttonText)}
    </Button>
  );
}

export default CopyButton;
