"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { deletePollAction } from "@/app/lib/actions";

export default function DeletePollDialog({ pollId }: { pollId: string }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button variant="destructive" onClick={() => setOpen(true)}>Delete Poll</Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete this poll?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            This action cannot be undone. This will permanently delete the poll and remove all data associated with it.
          </p>
          <DialogFooter>
            <form action={deletePollAction}>
              <input type="hidden" name="pollId" value={pollId} />
              <Button variant="destructive" type="submit">Confirm delete</Button>
            </form>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
