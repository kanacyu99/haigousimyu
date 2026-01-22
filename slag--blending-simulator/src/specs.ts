// src/specs.ts
export type SieveSpec = { mm: number; lower: number; upper: number };
export type ProductSpec = { sieves: SieveSpec[] };

// ✅ ボタン表示名はここでは扱わない（IDのみ）
export const SPEC_OPTIONS = [
  { id: "HMS-25", label: "HMS-25（鉄鋼スラグ路盤材）" },
  { id: "MS-25",  label: "MS-25（鉄鋼スラグ路盤材）" },
  { id: "CS-40",  label: "CS-40（鉄鋼スラグ路盤材）" },
  { id: "CS-30",  label: "CS-30（鉄鋼スラグ路盤材）" },
  { id: "CS-20",  label: "CS-20（鉄鋼スラグ路盤材）" },
  { id: "RC-40",  label: "RC-40（再生クラッシャラン）" },
  { id: "RC-30",  label: "RC-30（再生クラッシャラン）" },
  { id: "RC-20",  label: "RC-20（再生クラッシャラン）" },
  { id: "RM-40",  label: "RM-40（再生粒度調整砕石）" },
  { id: "RM-30",  label: "RM-30（再生粒度調整砕石）" },
  { id: "RM-25",  label: "RM-25（再生粒度調整砕石）" },
] as const;

export type ProductSpecName = typeof SPEC_OPTIONS[number]["id"];

// ✅ ふるいは mm に統一（425µm=0.425, 75µm=0.075）
export const PRODUCT_SPECS: Record<ProductSpecName, ProductSpec> = {
  "HMS-25": {
    sieves: [
      { mm: 31.5, lower: 100, upper: 100 },
      { mm: 26.5, lower: 95,  upper: 100 },
      { mm: 13.2, lower: 60,  upper: 80  },
      { mm: 4.75, lower: 35,  upper: 60  },
      { mm: 2.36, lower: 10,  upper: 25  },
      { mm: 0.425, lower: 3,  upper: 10  },
    ],
  },
  "MS-25": {
    sieves: [
      { mm: 31.5, lower: 100, upper: 100 },
      { mm: 26.5, lower: 95,  upper: 100 },
      { mm: 13.2, lower: 55,  upper: 85  },
      { mm: 4.75, lower: 30,  upper: 65  },
      { mm: 2.36, lower: 20,  upper: 50  },
      { mm: 0.425, lower: 2,  upper: 10  },
    ],
  },
  "CS-40": {
    sieves: [
      { mm: 53.0, lower: 100, upper: 100 },
      { mm: 37.5, lower: 95,  upper: 100 },
      { mm: 19.0, lower: 50,  upper: 80  },
      { mm: 4.75, lower: 15,  upper: 40  },
      { mm: 2.36, lower: 5,   upper: 25  },
    ],
  },
  "CS-30": {
    sieves: [
      { mm: 37.5, lower: 100, upper: 100 },
      { mm: 31.5, lower: 95,  upper: 100 },
      { mm: 19.0, lower: 55,  upper: 85  },
      { mm: 4.75, lower: 15,  upper: 45  },
      { mm: 2.36, lower: 5,   upper: 30  },
    ],
  },
  "CS-20": {
    sieves: [
      { mm: 26.5, lower: 100, upper: 100 },
      { mm: 19.0, lower: 95,  upper: 100 },
      { mm: 13.2, lower: 60,  upper: 90  },
      { mm: 4.75, lower: 20,  upper: 50  },
      { mm: 2.36, lower: 10,  upper: 35  },
    ],
  },
  "RC-40": {
    sieves: [
      { mm: 53.0, lower: 100, upper: 100 },
      { mm: 37.5, lower: 95,  upper: 100 },
      { mm: 19.0, lower: 50,  upper: 80  },
      { mm: 4.75, lower: 15,  upper: 40  },
      { mm: 2.36, lower: 5,   upper: 25  },
    ],
  },
  "RC-30": {
    sieves: [
      { mm: 31.5, lower: 100, upper: 100 },
      { mm: 26.5, lower: 95,  upper: 100 },
      { mm: 19.0, lower: 55,  upper: 85  },
      { mm: 4.75, lower: 15,  upper: 45  },
      { mm: 2.36, lower: 5,   upper: 30  },
    ],
  },
  "RC-20": {
    sieves: [
      { mm: 26.5, lower: 100, upper: 100 },
      { mm: 19.0, lower: 95,  upper: 100 },
      { mm: 13.2, lower: 60,  upper: 90  },
      { mm: 4.75, lower: 20,  upper: 50  },
      { mm: 2.36, lower: 10,  upper: 35  },
    ],
  },
  "RM-40": {
    sieves: [
      { mm: 53.0, lower: 100, upper: 100 },
      { mm: 37.5, lower: 95,  upper: 100 },
      { mm: 19.0, lower: 60,  upper: 90  },
      { mm: 4.75, lower: 30,  upper: 65  },
      { mm: 2.36, lower: 20,  upper: 50  },
      { mm: 0.425, lower: 10, upper: 30  },
      { mm: 0.075, lower: 2,  upper: 10  },
    ],
  },
  "RM-30": {
    sieves: [
      { mm: 31.5, lower: 100, upper: 100 },
      { mm: 26.5, lower: 95,  upper: 100 },
      { mm: 19.0, lower: 60,  upper: 90  },
      { mm: 4.75, lower: 30,  upper: 65  },
      { mm: 2.36, lower: 20,  upper: 50  },
      { mm: 0.425, lower: 10, upper: 30  },
      { mm: 0.075, lower: 2,  upper: 10  },
    ],
  },
  "RM-25": {
    sieves: [
      { mm: 31.5, lower: 100, upper: 100 },
      { mm: 26.5, lower: 95,  upper: 100 },
      { mm: 19.0, lower: 55,  upper: 85  },
      { mm: 4.75, lower: 30,  upper: 65  },
      { mm: 2.36, lower: 20,  upper: 50  },
      { mm: 0.425, lower: 10, upper: 30  },
      { mm: 0.075, lower: 2,  upper: 10  },
    ],
  },
};

export const isValidSpecName = (x: unknown): x is ProductSpecName => {
  return typeof x === "string" && (x as string) in PRODUCT_SPECS;
};
