// src/types/hawker.ts
export interface HawkerCentre {
  id: string;
  name: string;
  address: string;
  isOpen: boolean;
  openingHours: string; // e.g. "8:00 AM - 8:00 PM"
}
