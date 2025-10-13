import { useEffect, useRef } from "react";
import SignaturePad from "signature_pad";

export interface SignatureCanvasProps {
  height?: number;
  onReady?: (pad: SignaturePad) => void;
}

export default function SignatureCanvas({ height = 160, onReady }: SignatureCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!canvasRef.current) {
      return;
    }

    const pad = new SignaturePad(canvasRef.current, {
      backgroundColor: "rgba(255,255,255,1)",
      penColor: "#111827",
    });

    if (onReady) {
      onReady(pad);
    }

    return () => {
      pad.off();
      pad.clear();
    };
  }, [onReady]);

  return <canvas ref={canvasRef} height={height} className="w-full bg-white border border-slate-200 rounded-xl" />;
}
