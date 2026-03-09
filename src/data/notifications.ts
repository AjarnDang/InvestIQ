import type { Notification } from "@/src/types";

export const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: "N001",
    title: "Price Alert Triggered",
    message: "SCC has reached your target price of ฿300.00",
    type: "info",
    read: false,
    createdAt: "2026-03-09T09:15:00Z",
  },
  {
    id: "N002",
    title: "Dividend Received",
    message: "You received ฿8,750 dividend from PTT",
    type: "success",
    read: false,
    createdAt: "2026-03-05T14:30:00Z",
  },
  {
    id: "N003",
    title: "Market Update",
    message: "SET Index is up +0.61% today",
    type: "info",
    read: true,
    createdAt: "2026-03-09T08:00:00Z",
  },
];
