import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import type SignaturePad from "signature_pad";

export interface FieldPosition {
  x: number;
  y: number;
  w?: number;
  h?: number;
}

export type FieldMap = Record<string, FieldPosition>;

export interface PodFields {
  container_number?: string;
  customer?: string;
  pickup?: string;
  dropoff?: string;
  move_date?: string;
  driver_name?: string;
  notes?: string;
}

async function embedSignature(pdf: PDFDocument, pad: SignaturePad, field: FieldPosition) {
  const pngBytes = await fetch(pad.toDataURL("image/png")).then((res) => res.arrayBuffer());
  const pngImage = await pdf.embedPng(pngBytes);
  const page = pdf.getPages()[0];

  page.drawImage(pngImage, {
    x: field.x,
    y: field.y,
    width: field.w ?? pngImage.width,
    height: field.h ?? pngImage.height,
  });
}

export async function createPodPdf(templateBytes: ArrayBuffer, fields: PodFields, signaturePad: SignaturePad | null, fieldMap: FieldMap) {
  const pdf = await PDFDocument.load(templateBytes);
  const page = pdf.getPages()[0];
  const font = await pdf.embedFont(StandardFonts.Helvetica);

  const drawText = (value: string | undefined, field?: FieldPosition) => {
    if (!value || !field) {
      return;
    }

    page.drawText(value, {
      x: field.x,
      y: field.y,
      font,
      size: 12,
      color: rgb(0, 0, 0),
    });
  };

  Object.entries(fields).forEach(([key, value]) => {
    drawText(value, fieldMap[key]);
  });

  if (signaturePad && !signaturePad.isEmpty() && fieldMap.signature) {
    await embedSignature(pdf, signaturePad, fieldMap.signature);
  }

  return pdf.save();
}
