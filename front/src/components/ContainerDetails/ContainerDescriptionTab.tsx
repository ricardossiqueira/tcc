import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import MarkdownPreview from "@uiw/react-markdown-preview";
import tailwindconfig from "../../../tailwind.config";
import { useQueryClient } from "@tanstack/react-query";
import {
  IContainerDetails,
  useGetContainerDetailsQuery,
} from "../../api/containers";

interface ContainerDescriptionTabProps {
  containerId: string;
}

function ContainerDescriptionTab({
  containerId,
}: ContainerDescriptionTabProps) {
  const queryClient = useQueryClient();
  const container = queryClient.getQueryData<IContainerDetails>(
    useGetContainerDetailsQuery(containerId).queryKey,
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Service Description</CardTitle>
        <span className="text-sm text-muted-foreground">
          This is an AI description generated based on the container's service.
        </span>
      </CardHeader>
      <CardContent>
        <MarkdownPreview
          source={container?.description}
          style={{
            borderColor: tailwindconfig.theme.extend.colors.border,
            borderWidth: "1px",
            backgroundColor: tailwindconfig.theme.extend.colors.background,
            color: tailwindconfig.theme.extend.colors.primary,
            padding: "1rem",
            borderRadius: tailwindconfig.theme.extend.borderRadius.md,
          }}
        />
      </CardContent>
    </Card>
  );
}

export { ContainerDescriptionTab };
