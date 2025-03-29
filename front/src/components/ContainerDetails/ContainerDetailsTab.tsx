import {
  IContainerDetails,
  useGetContainerDetailsQuery,
} from "../../api/containers";
import { ContainerStatusBadge } from "../ContainerStatusBadge";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";
import { useQueryClient } from "@tanstack/react-query";
import ReactCodeMirror from "@uiw/react-codemirror";
import { aura } from "@uiw/codemirror-theme-aura";
import { python } from "@codemirror/lang-python";

interface ContainerDetailsTabProps {
  containerId: string;
}

export function ContainerDetailsTab({ containerId }: ContainerDetailsTabProps) {
  const queryClient = useQueryClient();
  const container = queryClient.getQueryData<IContainerDetails>(
    useGetContainerDetailsQuery(containerId).queryKey,
  );

  return (
    <div className="grid gap-6 md:grid-cols-2 grid-rows-3">
      <Card className="h-full">
        <CardHeader>
          <CardTitle>Container Information</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-[1fr_2fr] gap-2 text-sm">
            <dt className="font-medium">ID:</dt>
            <dd className="font-mono">{container.id}</dd>

            <dt className="font-medium">Name:</dt>
            <dd>{container.name}</dd>

            <dt className="font-medium">Image:</dt>
            <dd>{container.image}</dd>

            <dt className="font-medium">Status:</dt>
            <dd>
              <ContainerStatusBadge status={container.status} />
            </dd>

            <dt className="font-medium">Created:</dt>
            <dd>{container.created}</dd>

            <dt className="font-medium">Ports:</dt>
            <dd>{container.port}</dd>
          </dl>
        </CardContent>
      </Card>
      <Card className="h-full flex flex-col row-span-3">
        <CardHeader>
          <CardTitle>Service Details</CardTitle>
        </CardHeader>
        <CardContent className="h-full flex">
          <div className="space-y-4 relative flex flex-1 flex-col w-full">
            <div className="rounded-md bg-muted p-3 text-sm">
              {container.prompt || "No prompt information available"}
            </div>
            <div className="relative flex-1">
              <div className="absolute top-0 left-0 right-0 bg-purple-600 text-xs font-semibold px-4 py-1 rounded-t-md w-fit">
                main.py
              </div>
              <ReactCodeMirror
                theme={aura}
                extensions={[python()]}
                className="pt-6 h-full"
                value={container.script || "# No code available"}
                editable={false}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
