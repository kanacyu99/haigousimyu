export const PRODUCT_SPECS = {
  "HMS-25": {
    name: "HMS-25 (鉄鋼スラグ路盤材)",
    sieves: [
      { mm: 31.5, lower: 100, upper: 100 },
      { mm: 26.5, lower: 95, upper: 100 },
      { mm: 13.2, lower: 60, upper: 80 },
      { mm: 4.75, lower: 35, upper: 60 },
      { mm: 2.36, lower: 10, upper: 25 },
      { mm: 0.425, lower: 3, upper: 10 },
    ],
  },
  "MS-25": {
    name: "MS-25 (鉄鋼スラグ路盤材)",
    sieves: [
      { mm: 31.5, lower: 100, upper: 100 },
      { mm: 26.5, lower: 95, upper: 100 },
      { mm: 13.2, lower: 55, upper: 85 },
      { mm: 4.75, lower: 30, upper: 65 },
      { mm: 2.36, lower: 20, upper: 50 },
      { mm: 0.425, lower: 2, upper: 10 },
    ],
  },
  "CS-40": {
    name: "CS-40 (鉄鋼スラグ路盤材)",
    sieves: [
      { mm: 53.0, lower: 100, upper: 100 },
      { mm: 37.5, lower: 95, upper: 100 },
      { mm: 19.0, lower: 50, upper: 80 },
      { mm: 4.75, lower: 15, upper: 40 },
      { mm: 2.36, lower: 5, upper: 25 },
    ],
  },
  "CS-30": {
    name: "CS-30 (鉄鋼スラグ路盤材)",
    sieves: [
      { mm: 37.5, lower: 100, upper: 100 },
      { mm: 31.5, lower: 95, upper: 100 },
      { mm: 19.0, lower: 55, upper: 85 },
      { mm: 4.75, lower: 15, upper: 45 },
      { mm: 2.36, lower: 5, upper: 30 },
    ],
  },
  "CS-20": {
    name: "CS-20 (鉄鋼スラグ路盤材)",
    sieves: [
        { mm: 26.5, lower: 100, upper: 100 },
        { mm: 19.0, lower: 95, upper: 100 },
        { mm: 13.2, lower: 60, upper: 90 },
        { mm: 4.75, lower: 20, upper: 50 },
        { mm: 2.36, lower: 10, upper: 35 },
    ],
  },
  "RC-40": {
    name: "RC-40 (再生路盤材)",
    sieves: [
      { mm: 53.0, lower: 100, upper: 100 },
      { mm: 37.5, lower: 95, upper: 100 },
      { mm: 19.0, lower: 50, upper: 80 },
      { mm: 4.75, lower: 15, upper: 40 },
      { mm: 2.36, lower: 5, upper: 25 },
    ],
  },
  "RC-30": {
    name: "RC-30 (再生路盤材)",
    sieves: [
      { mm: 31.5, lower: 100, upper: 100 },
      { mm: 26.5, lower: 95, upper: 100 },
      { mm: 19.0, lower: 55, upper: 85 },
      { mm: 4.75, lower: 15, upper: 45 },
      { mm: 2.36, lower: 5, upper: 30 },
    ],
  },
  "RC-20": {
    name: "RC-20 (再生路盤材)",
    sieves: [
        { mm: 26.5, lower: 100, upper: 100 },
        { mm: 19.0, lower: 95, upper: 100 },
        { mm: 13.2, lower: 60, upper: 90 },
        { mm: 4.75, lower: 20, upper: 50 },
        { mm: 2.36, lower: 10, upper: 35 },
    ],
  },
  "RM-40": {
    name: "RM-40 (再生粒度調整砕石)",
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
    name: "RM-30 (再生粒度調整砕石)",
    sieves: [
      { mm: 31.5, lower: 100, upper: 100 },
      { mm: 26.5, lower: 95, upper: 100 },
      { mm: 19.0, lower: 60, upper: 90 },
      { mm: 4.75, lower: 30, upper: 65 },
      { mm: 2.36, lower: 20, upper: 50 },
      { mm: 0.425, lower: 10, upper: 30 },
      { mm: 0.075, lower: 2, upper: 10 },
    ],
  },
  "RM-25": {
    name: "RM-25 (再生粒度調整砕石)",
    sieves: [
      { mm: 31.5, lower: 100, upper: 100 },
      { mm: 26.5, lower: 95, upper: 100 },
      { mm: 19.0, lower: 55, upper: 85 },
      { mm: 4.75, lower: 30, upper: 65 },
      { mm: 2.36, lower: 20, upper: 50 },
      { mm: 0.425, lower: 10, upper: 30 },
      { mm: 0.075, lower: 2, upper: 10 },
    ],
  },
} as const;

export type ProductSpecName = keyof typeof PRODUCT_SPECS;
