export function formatDate(value: string | null | undefined) {
  if (!value) {
    return "";
  }

  try {
    return new Date(value).toLocaleDateString();
  } catch (error) {
    console.warn("Unable to format date", error);
    return value;
  }
}

export function toFileName(value: string, extension: string) {
  const safe = value.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  return `${safe || "pod"}.${extension}`;
}
