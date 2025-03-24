import { Button, buttonVariants } from "../ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Trash2 } from "lucide-react";
import { useDeleteContainerMutation } from "../../api/containers";
import { useRouter } from "next/navigation";

interface DeleteDialogProps {
  isLoading?: boolean;
  containerId: string;
  pushHome?: boolean;
}

function DeleteDialog({
  containerId,
  isLoading,
  pushHome = false,
}: DeleteDialogProps) {
  const { push } = useRouter();

  const { mutate: deleteContainerMutate, isPending: isDeletePending } =
    useDeleteContainerMutation({
      containerId,
      onSuccess: () => {
        pushHome && push("/app/containers");
      },
    });

  return (
    <Dialog>
      <DialogTrigger className={buttonVariants({ variant: "destructive" })}>
        <Trash2 className="mr-2 h-4 w-4" />
        Delete
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this container?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="destructive"
            onClick={() => void deleteContainerMutate()}
            isLoading={isDeletePending}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </Button>
          <DialogClose
            color="secondary"
            className={buttonVariants({ variant: "secondary" })}
          >
            Cancel
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export { DeleteDialog };
