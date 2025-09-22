"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import Link from "next/link";
import { toast } from "sonner";
import QRCode from "qrcode";

export default function QRCodeButton({ pollId }: { pollId: string }) {
  const [open, setOpen] = useState(false);
  const [dataUrl, setDataUrl] = useState<string | null>(null);

  const pollUrl = useMemo(() => {
    if (typeof window === "undefined") return "";
    return `${window.location.origin}/p/${pollId}`;
  }, [pollId]);

  async function ensureQr() {
    try {
      if (!dataUrl) {
        const url = await QRCode.toDataURL(pollUrl, {
          width: 320,
          margin: 1,
          errorCorrectionLevel: "M",
        });
        setDataUrl(url);
      }
    } catch (e) {
      toast.error("Failed to generate QR");
    }
  }

  function download() {
    if (!dataUrl) return;
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = `poll-${pollId}-qr.png`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  }

  return (
    <>
      <Button variant="outline" onClick={() => { setOpen(true); ensureQr(); }}>QR Code</Button>
      <Dialog open={open} onOpenChange={(v) => setOpen(v)}>
        <DialogContent>
        <DialogHeader>
          <DialogTitle>Scan to vote</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center gap-4 py-2">
          {dataUrl ? (
            <img src={dataUrl} alt="Poll QR Code" className="w-64 h-64" />
          ) : (
            <div className="w-64 h-64 grid place-items-center text-sm text-muted-foreground">Generating…</div>
          )}
          <div className="w-full flex items-center justify-between text-xs text-muted-foreground">
            <span className="truncate">{pollUrl}</span>
            <Button size="sm" variant="secondary" onClick={() => { navigator.clipboard.writeText(pollUrl); toast.success("URL copied"); }}>Copy URL</Button>
          </div>
          <Button className="w-full" onClick={download}>Download PNG</Button>
          <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>Close</Button>
            <Button onClick={() => window.open(pollUrl, "_blank", "noopener,noreferrer")}>Open Public Poll</Button>
          </div>
          <Link href={`/polls/${pollId}`} className="w-full">
            <Button variant="secondary" className="w-full">Go to Dashboard</Button>
          </Link>
        </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
