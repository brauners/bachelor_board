import { useEffect, useState } from "react";
import QRCode from "qrcode";

type GuestQrCodeProps = {
  url: string;
};

export function GuestQrCode({ url }: GuestQrCodeProps) {
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>("");

  useEffect(() => {
    let cancelled = false;

    const generateQrCode = async () => {
      if (!url) {
        setQrCodeDataUrl("");
        return;
      }

      try {
        const dataUrl = await QRCode.toDataURL(url, {
          margin: 1,
          width: 144,
          color: {
            dark: "#080b14",
            light: "#f8fafc"
          }
        });

        if (!cancelled) {
          setQrCodeDataUrl(dataUrl);
        }
      } catch {
        if (!cancelled) {
          setQrCodeDataUrl("");
        }
      }
    };

    void generateQrCode();

    return () => {
      cancelled = true;
    };
  }, [url]);

  return (
    <div className="flex w-fit flex-col items-center gap-2 rounded-[1.5rem] border border-white/10 bg-white/90 p-3 shadow-neon">
      {qrCodeDataUrl ? (
        <img
          src={qrCodeDataUrl}
          alt="QR-Code fuer die Gastansicht"
          className="h-32 w-32 rounded-lg"
        />
      ) : (
        <div className="flex h-32 w-32 items-center justify-center rounded-lg bg-white text-xs uppercase tracking-[0.2em] text-stage-900">
          Lade QR
        </div>
      )}
      <div className="text-[0.65rem] font-semibold uppercase tracking-[0.25em] text-stage-900">
        Scan me
      </div>
    </div>
  );
}
