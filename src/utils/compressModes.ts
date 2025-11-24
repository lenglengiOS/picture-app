export type CompressModeKey = "low" | "balance" | "high";

export interface CompressMode {
  quality: number;
  maxWidthOrHeight?: number | null;
}

export const compressModes: Record<CompressModeKey, CompressMode> = {
  low: {
    quality: 0.4,
    maxWidthOrHeight: null,
  },
  balance: {
    quality: 0.6,
    maxWidthOrHeight: null,
  },
  high: {
    quality: 0.7,
    maxWidthOrHeight: null,
  },
};
