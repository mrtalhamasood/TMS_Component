const GRAPH_BASE = "https://graph.microsoft.com/v1.0/me/drive";
const DEFAULT_FOLDER = "/PODs";

type UploadResponse = {
  id: string;
};

type ShareLinkResponse = {
  link: {
    webUrl: string;
  };
};

export async function uploadPdfToOneDrive(token: string, bytes: Uint8Array, filename: string, folder: string = DEFAULT_FOLDER) {
  const path = `${folder}/${filename}`.replace(/\\+/g, "/");
  const uploadUrl = `${GRAPH_BASE}/root:${path}:/content`;

  const uploadResponse = await fetch(uploadUrl, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: bytes,
  });

  if (!uploadResponse.ok) {
    throw new Error(`OneDrive upload failed with status ${uploadResponse.status}`);
  }

  const uploadJson = (await uploadResponse.json()) as UploadResponse;

  const shareResponse = await fetch(`${GRAPH_BASE}/items/${uploadJson.id}/createLink`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ type: "view", scope: "anonymous" }),
  });

  if (!shareResponse.ok) {
    throw new Error(`OneDrive createLink failed with status ${shareResponse.status}`);
  }

  const shareJson = (await shareResponse.json()) as ShareLinkResponse;
  return shareJson.link.webUrl;
}
