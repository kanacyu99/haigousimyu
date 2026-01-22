import { PRODUCT_SPECS } from './specs';

// 製品規格の名称の型 (e.g., "HMS-25")
export type ProductSpecName = keyof typeof PRODUCT_SPECS;

// 単一のふるいデータを表す型
export interface SieveData {
  mm: number;
  lower: number;
  upper: number;
}

// ブレンドされた結果の各ふるいのデータを表す型
export interface BlendedSieveResult extends SieveData {
  passing: number;
  isOk: boolean;
}

// 原料のデータを表す型
export interface Material {
  id: string; // 一意なID
  name: string;
  ratio: number; // 配合率 (%)
  // キーがふるいサイズ(mm)、値が通過質量百分率(%)のオブジェクト
  passingPercentages: { [sieveSize: number]: number };
}
