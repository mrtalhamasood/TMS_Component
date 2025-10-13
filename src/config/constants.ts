export const FIELD_MAP = {
  container_number: { x: 70, y: 670 },
  customer: { x: 70, y: 640 },
  pickup: { x: 70, y: 610 },
  dropoff: { x: 70, y: 580 },
  move_date: { x: 420, y: 670 },
  driver_name: { x: 420, y: 640 },
  notes: { x: 70, y: 520 },
  signature: { x: 380, y: 520, w: 180, h: 60 },
} as const;

export const GRAPH_SCOPES = ["Files.ReadWrite", "User.Read", "offline_access"];

export const ONE_DRIVE_FOLDER = "/PODs";
