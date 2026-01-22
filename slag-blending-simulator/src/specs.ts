// slag-blending-simulator/src/specs.ts

export type SieveSpec = {
  mm: number;
  lower: number;
  upper: number;
};

export type ProductSpec = {
  name: string; // ★ App.tsx が参照しているので必要
  sieves: SieveSpec[];
};

export type ProductSpecName =
  | "HMS-25"
  | "MS-25"
  | "CS-40"
  | "CS-30"
  | "CS-20"
  | "RC-40"
  | "RC-30"
  | "RC-20"
  | "RM-40"
  | "RM-30"
  | "RM-25";

export const PRODUCT_SPECS: Record<ProductSpecName, ProductSpec> = {
  // -----------------------------
  // 表3 粒度（鉄鋼スラグ路盤材）
  // -----------------------------
  "HMS-25": {
    name: "HMS-25（鉄鋼スラグ路盤材）",
    sieves: [
      { mm: 31.5, lower: 100, upper: 100 },
      { mm: 26.5, lower: 95, upper: 100 },
      { mm: 13.2, lower: 60, upper: 80 },
      { mm: 4.75, lower: 35, upper: 60 },
      { mm: 2.36, lower: 25, upper: 45 },
      { mm: 0.425, lower: 10, upper: 25 },
      { mm: 0.075, lower: 3, upper: 10 },
    ],
  },

  "MS-25": {
    name: "MS-25（鉄鋼スラグ路盤材）",
    sieves: [
      { mm: 31.5, lower: 100, upper: 100 },
      { mm: 26.5, lower: 95, upper: 100 },
      { mm: 13.2, lower: 55, upper: 85 },
      { mm: 4.75, lower: 30, upper: 65 },
      { mm: 2.36, lower: 20, upper: 50 },
      { mm: 0.425, lower: 10, upper: 30 },
      { mm: 0.075, lower: 2, upper: 10 },
    ],
  },

  "CS-40": {
    name: "CS-40（鉄鋼スラグ路盤材）",
    sieves: [
      { mm: 53.0, lower: 100, upper: 100 },
      { mm: 37.5, lower: 95, upper: 100 },
      { mm: 19.0, lower: 50, upper: 80 },
      { mm: 4.75, lower: 15, upper: 40 },
      { mm: 2.36, lower: 5, upper: 25 },
    ],
  },

  "CS-30": {
    name: "CS-30（鉄鋼スラグ路盤材）",
    sieves: [
      { mm: 31.5, lower: 100, upper: 100 },
      { mm: 26.5, lower: 95, upper: 100 },
      { mm: 19.0, lower: 55, upper: 85 },
      { mm: 4.75, lower: 15, upper: 45 },
      { mm: 2.36, lower: 5, upper: 30 },
    ],
  },

  "CS-20": {
    name: "CS-20（鉄鋼スラグ路盤材）",
    sieves: [
      { mm: 26.5, lower: 100, upper: 100 },
      { mm: 19.0, lower: 95, upper: 100 },
      { mm: 13.2, lower: 60, upper: 90 },
      { mm: 4.75, lower: 20, upper: 50 },
      { mm: 2.36, lower: 10, upper: 35 },
    ],
  },

  // --------------------------------------
  // 表-2.4.2 再生クラッシャラン（RC）
  // --------------------------------------
  "RC-40": {
    name: "RC-40（再生路盤材）",
    sieves: [
      { mm: 53.0, lower: 100, upper: 100 },
      { mm: 37.5, lower: 95, upper: 100 },
      { mm: 19.0, lower: 50, upper: 80 },
      { mm: 4.75, lower: 15, upper: 40 },
      { mm: 2.36, lower: 5, upper: 25 },
    ],
  },

  "RC-30": {
    name: "RC-30（再生路盤材）",
    sieves: [
      { mm: 37.5, lower: 100, upper: 100 },
      { mm: 31.5, lower: 95, upper: 100 },
      { mm: 19.0, lower: 55, upper: 85 },
      { mm: 4.75, lower: 15, upper: 45 },
      { mm: 2.36, lower: 5, upper: 30 },
    ],
  },

  "RC-20": {
    name: "RC-20（再生路盤材）",
    sieves: [
      { mm: 26.5, lower: 100, upper: 100 },
      { mm: 19.0, lower: 95, upper: 100 },
      { mm: 13.2, lower: 60, upper: 90 },
      { mm: 4.75, lower: 20, upper: 50 },
      { mm: 2.36, lower: 10, upper: 35 },
    ],
  },

  // ------------------------------------------
  // 表-2.4.6 再生粒度調整砕石（RM）
  // ------------------------------------------
  "RM-40": {
    name: "RM-40（再生粒度調整砕石）",
    sieves: [
      { mm: 53.0, lower: 100, upper: 100 },
      { mm: 37.5, lower: 95, upper: 100 },
      { mm: 19.0, lower: 60, upper: 90 },
      { mm: 4.75, lower: 30, upper: 65 },
      { mm: 2.36, lower: 20, upper: 50 },
      { mm: 0.425, lower: 10, upper: 30 },
      { mm: 0.075, lower: 2, upper: 10 },
    ],
  },

  "RM-30": {
    name: "RM-30（再生粒度調整砕石）",
    sieves: [
      { mm: 37.5, lower: 100, upper: 100 },
      { mm: 31.5, lower: 95, upper: 100 },
      { mm: 19.0, lower: 60, upper: 90 },
      { mm: 4.75, lower: 30, upper: 65 },
      { mm: 2.36, lower: 20, upper: 50 },
      { mm: 0.425, lower: 10, upper: 30 },
      { mm: 0.075, lower: 2, upper: 10 },
    ],
  },

  "RM-25": {
    name: "RM-25（再生粒度調整砕石）",
    sieves: [
      { mm: 31.5, lower: 100, upper: 100 },
      { mm: 26.5, lower: 95, upper: 100 },
      { mm: 13.2, lower: 55, upper: 85 },
      { mm: 4.75, lower: 30, upper: 65 },
      { mm: 2.36, lower: 20, upper: 50 },
      { mm: 0.425, lower: 10, upper: 30 },
      { mm: 0.075, lower: 2, upper: 10 },
    ],
  },
};

// 規格ボタン表示用
export const SPEC_OPTIONS: { id: ProductSpecName; label: string }[] = [
  { id: "HMS-25", label: "HMS-25（鉄鋼スラグ路盤材）" },
  { id: "MS-25", label: "MS-25（鉄鋼スラグ路盤材）" },
  { id: "CS-40", label: "CS-40（鉄鋼スラグ路盤材）" },
  { id: "CS-30", label: "CS-30（鉄鋼スラグ路盤材）" },
  { id: "CS-20", label: "CS-20（鉄鋼スラグ路盤材）" },
  { id: "RC-40", label: "RC-40（再生路盤材）" },
  { id: "RC-30", label: "RC-30（再生路盤材）" },
  { id: "RC-20", label: "RC-20（再生路盤材）" },
  { id: "RM-40", label: "RM-40（再生粒度調整砕石）" },
  { id: "RM-30", label: "RM-30（再生粒度調整砕石）" },
  { id: "RM-25", label: "RM-25（再生粒度調整砕石）" },
];

// localStorage安全化で使う
export const isValidSpecName = (x: any): x is ProductSpecName => {
  return (
    x === "HMS-25" ||
    x === "MS-25" ||
    x === "CS-40" ||
    x === "CS-30" ||
    x === "CS-20" ||
    x === "RC-40" ||
    x === "RC-30" ||
    x === "RC-20" ||
    x === "RM-40" ||
    x === "RM-30" ||
    x === "RM-25"
  );
};

// App.tsx の「全篩表示」用：全規格に登場するふるいをまとめる
export const ALL_SIEVES_MM: number[] = (() => {
  const set = new Set<number>();
  (Object.keys(PRODUCT_SPECS) as ProductSpecName[]).forEach((k) => {
    PRODUCT_SPECS[k].sieves.forEach((s) => set.add(Number(s.mm)));
  });

  // 大きい→小さい
  return Array.from(set).sort((a, b) => b - a);
})();
