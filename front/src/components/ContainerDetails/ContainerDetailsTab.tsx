import SyntaxHighlighter from "react-syntax-highlighter";
import { dark } from "react-syntax-highlighter/dist/esm/styles/hljs";
import { IContainerDetails, useGetContainerDetailsQuery } from "../../api/containers";
import { ContainerStatusBadge } from "../ContainerStatusBadge";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";
import { useQueryClient } from "@tanstack/react-query";

interface ContainerDetailsTabProps {
  containerId: string;
}

export function ContainerDetailsTab({ containerId }: ContainerDetailsTabProps) {
  const queryClient = useQueryClient();
  const container = queryClient.getQueryData<IContainerDetails>(useGetContainerDetailsQuery(containerId).queryKey);

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card className="h-fit">
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
      <Card className="h-fit">
        <CardHeader>
          <CardTitle>Generation Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-1">Prompt</h4>
              <div className="rounded-md bg-muted p-3 text-sm">
                {container.prompt || "No prompt information available"}
              </div>
            </div>
            <div>
              <h4 className="font-medium mb-1">Deployed Code</h4>
              <SyntaxHighlighter language="python" style={dark} className="rounded-md bg-muted p-3 font-mono text-xs" showLineNumbers>
                {container.script || "# No code available"}
              </SyntaxHighlighter>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>

  )
}
