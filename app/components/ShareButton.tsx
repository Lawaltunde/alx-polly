'use client'

import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function ShareButton({ pollId }: { pollId: string }) {
    const shareLink = () => {
        const url = `${window.location.origin}/p/${pollId}`;
        navigator.clipboard.writeText(url);
        toast.success("Link copied to clipboard!");
    }

    return (
        <Button onClick={shareLink}>Share</Button>
    )
}