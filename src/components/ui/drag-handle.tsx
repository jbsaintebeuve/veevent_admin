import { IconGripVertical } from "@tabler/icons-react";
import { Button } from "./button";

export function DragHandle() {
  return (
    <Button
      variant="ghost"
      size="icon"
      className="text-muted-foreground size-7 hover:bg-transparent cursor-default"
      disabled
    >
      <IconGripVertical className="text-muted-foreground size-3" />
      <span className="sr-only">Drag handle (disabled)</span>
    </Button>
  );
}
