import { useEffect, useMemo, useState } from "react";
import type SignaturePad from "signature_pad";

import Button from "../shared/Button";
import SignatureCanvas from "../shared/SignatureCanvas";
import Table from "../shared/Table";
import { supabase } from "../../lib/supabase/client";
import { acquireGraphToken } from "../../lib/onedrive/auth";
import { uploadPdfToOneDrive } from "../../lib/onedrive/upload";
import { createPodPdf } from "../../lib/pdf/createPodPdf";
import { sharePodLink } from "../../lib/utils/share";
import { formatDate, toFileName } from "../../lib/utils/format";
import { FIELD_MAP } from "../../config/constants";

interface Customer {
  id: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  preferred_contact?: "email" | "whatsapp" | null;
}

interface ContainerMove {
  id: string;
  container_number: string;
  pickup?: string | null;
  dropoff?: string | null;
  move_date?: string | null;
  driver_name?: string | null;
  notes?: string | null;
  pod_url?: string | null;
  customer?: Customer | null;
}

type ViewState = "idle" | "loading" | "error";

const templatePlaceholderMessage = "Upload a template PDF to enable generation.";

export default function PodGenerator() {
  const [moves, setMoves] = useState<ContainerMove[]>([]);
  const [selectedMove, setSelectedMove] = useState<ContainerMove | null>(null);
  const [signaturePad, setSignaturePad] = useState<SignaturePad | null>(null);
  const [templateBytes, setTemplateBytes] = useState<ArrayBuffer | null>(null);
  const [state, setState] = useState<ViewState>("idle");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void loadMoves();
  }, []);

  async function loadMoves() {
    setState("loading");
    setError(null);

    const { data, error: queryError } = await supabase
      .from("containers")
      .select(
        `id, container_number, pickup, dropoff, move_date, driver_name, notes, pod_url, customer:customer_id ( id, name, email, phone, preferred_contact )`,
      )
      .eq("status", "Completed")
      .is("pod_url", null);

    if (queryError) {
      setError(queryError.message);
      setState("error");
      return;
    }

    setMoves(data ?? []);
    setState("idle");
  }

  async function handleTemplateUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    const buffer = await file.arrayBuffer();
    setTemplateBytes(buffer);
  }

  async function handleGenerate(mode: "close" | "share") {
    if (!selectedMove) {
      return;
    }

    if (!templateBytes) {
      alert(templatePlaceholderMessage);
      return;
    }

    if (!signaturePad || signaturePad.isEmpty()) {
      const confirmContinue = window.confirm("No signature detected. Do you want to continue?");
      if (!confirmContinue) {
        return;
      }
    }

    try {
      setState("loading");
      const token = await acquireGraphToken();
      const pdfBytes = await createPodPdf(
        templateBytes,
        {
          container_number: selectedMove.container_number,
          customer: selectedMove.customer?.name ?? "",
          pickup: selectedMove.pickup ?? "",
          dropoff: selectedMove.dropoff ?? "",
          move_date: formatDate(selectedMove.move_date ?? undefined),
          driver_name: selectedMove.driver_name ?? "",
          notes: selectedMove.notes ?? "",
        },
        signaturePad,
        FIELD_MAP,
      );

      const filename = toFileName(selectedMove.container_number, "pdf");
      const shareUrl = await uploadPdfToOneDrive(token, pdfBytes, filename);

      await supabase
        .from("containers")
        .update({ pod_url: shareUrl })
        .eq("id", selectedMove.id);

      if (mode === "share") {
        sharePodLink({
          container: {
            container_number: selectedMove.container_number,
            driver_name: selectedMove.driver_name ?? undefined,
          },
          customer: selectedMove.customer ?? undefined,
          link: shareUrl,
        });
      }

      await loadMoves();
      setSelectedMove(null);
      signaturePad?.clear();
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Failed to generate POD");
      setState("error");
    } finally {
      setState("idle");
    }
  }

  const moveRows = useMemo(() => {
    if (!moves.length) {
      return [];
    }

    return moves.map((move) => [
      move.container_number,
      move.customer?.name ?? "—",
      move.pickup ?? "—",
      move.dropoff ?? "—",
      formatDate(move.move_date ?? undefined) ?? "—",
      <Button key={move.id} onClick={() => setSelectedMove(move)} variant="subtle">
        Select
      </Button>,
    ]);
  }, [moves]);

  return (
    <div className="pod-grid">
      <section className="panel">
        <div className="panel-heading">
          <h2>Completed moves without POD</h2>
          <p>Select a move to generate and sign its proof of delivery.</p>
        </div>

        {state === "loading" && <p className="status">Loading…</p>}
        {error && <p className="error">{error}</p>}

        {moves.length ? (
          <Table
            headers={["Container", "Customer", "Pickup", "Drop-off", "Date", "Actions"]}
            rows={moveRows}
          />
        ) : (
          <div className="empty">No completed moves pending a POD.</div>
        )}
      </section>

      <section className="panel">
        <div className="panel-heading">
          <h2>Template & Signature</h2>
          <p>Upload your POD template, review move details, and capture signature.</p>
        </div>

        <label className="file-input">
          <span>Template PDF</span>
          <input type="file" accept="application/pdf" onChange={handleTemplateUpload} />
        </label>

        {selectedMove ? (
          <div className="move-details">
            <h3>{selectedMove.container_number}</h3>
            <ul>
              <li>
                <strong>Customer:</strong> {selectedMove.customer?.name ?? "—"}
              </li>
              <li>
                <strong>Pickup:</strong> {selectedMove.pickup ?? "—"}
              </li>
              <li>
                <strong>Drop-off:</strong> {selectedMove.dropoff ?? "—"}
              </li>
              <li>
                <strong>Date:</strong> {formatDate(selectedMove.move_date ?? undefined) ?? "—"}
              </li>
              <li>
                <strong>Driver:</strong> {selectedMove.driver_name ?? "—"}
              </li>
            </ul>
          </div>
        ) : (
          <div className="empty">Select a move to see its details.</div>
        )}

        <div>
          <h3>Signature</h3>
          <SignatureCanvas onReady={setSignaturePad} />
          <div className="signature-actions">
            <Button variant="subtle" onClick={() => signaturePad?.clear()} disabled={!signaturePad}>
              Clear signature
            </Button>
          </div>
        </div>

        <div className="actions">
          <Button onClick={() => handleGenerate("close")} disabled={!selectedMove || state === "loading"}>
            Save &amp; Close
          </Button>
          <Button
            variant="success"
            onClick={() => handleGenerate("share")}
            disabled={!selectedMove || state === "loading"}
          >
            Save &amp; Share
          </Button>
        </div>
      </section>
    </div>
  );
}
