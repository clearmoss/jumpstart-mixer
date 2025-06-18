import { createFileRoute } from "@tanstack/react-router";
import { Button } from "@/components/ui/button.tsx";
import { useAtom } from "jotai/index";
import { motion } from "motion/react";
import { atomWithStorage } from "jotai/utils";

export const Route = createFileRoute("/test")({
  component: RouteComponent,
  pendingComponent: () => <div>Loading...</div>, // loading state
  errorComponent: () => <div>Error!</div>, // error state
});

const counter = atomWithStorage("count", 0);

function RouteComponent() {
  const [count, setCount] = useAtom(counter);
  const increaseCount = () => setCount((prev) => prev + 1);

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-3xl">Vite + React</h1>
      <Button
        className="max-w-fit cursor-pointer"
        variant="destructive"
        onClick={increaseCount}
      >
        count is {count}
      </Button>
      <motion.div
        className="w-16 h-16 bg-primary"
        initial={{ scale: 0 }}
        animate={{ rotate: 360, scale: 1 }}
        transition={{ duration: 1 }}
      />
    </div>
  );
}
