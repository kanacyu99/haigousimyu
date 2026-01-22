// src/types.ts
export type Material = {
  id: string;
  name: string;
  ratio: number;
  passingPercentages: Record<number, number>;
};

export type BlendedSieveResult = {
  mm: number;
  lower: number;
  upper: number;
  passing: number;
  isOk: boolean;
};
