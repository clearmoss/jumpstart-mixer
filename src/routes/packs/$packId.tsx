import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/packs/$packId")({
  component: RouteComponent,
  loader: async ({ params }) => {
    // you can async load and return data here, using params
    await new Promise((resolve) => setTimeout(resolve, 1000));

    return {
      packId: params.packId,
    };
  },
  pendingComponent: () => <div>Loading...</div>, // loading state
  errorComponent: () => <div>Error!</div>, // error state
});

function RouteComponent() {
  const { packId } = Route.useLoaderData();

  return <div>Hello {packId}</div>;
}
