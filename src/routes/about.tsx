import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/about")({
  head: () => {
    return {
      meta: [
        {
          title: "About Jumpstart",
        },
      ],
    };
  },
  component: About,
});

function About() {
  return <div className="p-2">Hello from About!</div>;
}
