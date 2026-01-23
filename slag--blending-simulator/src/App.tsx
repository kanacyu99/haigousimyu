import { useEffect, useMemo, useState } from "react";
import Plot from "react-plotly.js";
import { v4 as uuidv4 } from "uuid";

import { PRODUCT_SPECS } from "./specs";
import type { ProductSpecName } from "./specs";
import type { Material, BlendedSieveResult } from "./types";

import "./App.css";

// ==============================
// 全篩を固定（最重要）
// ==============================
const ALL_SIEVES = [
  53,
  37.5,
  31.5,
  26.5,
  19,
  13.2,
  4.75,
  2.36,
  0.425,
  0.075,
];

// 表示用（入力：大→小）
const ALL_SIEVES_DESC = [...ALL_SIEVES].sort((a, b) => b - a);
// グラフ用（左→右：小→大）
const ALL_SIEVES_ASC = [...ALL_SIEVES].sort((a, b) => a - b);

// ==============================
// utils
// ==============================
const createNewMaterial = (): Material => {
  const passing: Record<number, number> = {};
  ALL_SIEVES.forEach((mm) => (passing[mm] = 0));

  return {
    id: uuidv4(),
    name: `原料 ${Math.floor(Math.random() * 100)}`,
    ratio: 0,
    passingPercentages: passing,
  };
};

export default function App() {
  const [specName, setSpecName] = useState<ProductSpecName>("HMS-25");
  const [materials, setMaterials] = useState<Material[]>([createNewMaterial()]);

  // ------------------------------
  // localStorage
  // ------------------------------
  useEffect(() => {
    const saved = localStorage.getItem("slagBlendingState");
    if (!saved) return;

    try {
      const parsed = JSON.parse(saved);
      if (parsed?.specName) setSpecName(parsed.specName);
      if (Array.isArray(parsed?.materials)) {
        setMaterials(
          parsed.materials.map((m: any) => ({
            ...createNewMaterial(),
            ...m,
            passingPercentages: {
              ...createNewMaterial().passingPercentages,
              ...(m.passingPercentages ?? {}),
            },
          }))
        );
      }
    } catch {
      setMaterials([createNewMaterial()]);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(
      "slagBlendingState",
      JSON.stringify({ specName, materials })
    );
  }, [specName, materials]);

  // ------------------------------
  // handlers
  // ------------------------------
  const updateMaterial = (id: string, patch: Partial<Material>) => {
    setMaterials((prev) =>
      prev.map((m) => (m.id === id ? { ...m, ...patch } : m))
    );
  };

  const handlePassingChange = (
    id: string,
    mm: number,
    value: string
  ) => {
    const v = Number(value);
    if (v < 0 || v > 100 || Number.isNaN(v)) return;

    setMaterials((prev) =>
      prev.map((m) =>
        m.id === id
          ? {
              ...m,
              passingPercentages: {
                ...m.passingPercentages,
                [mm]: v,
              },
            }
          : m
      )
    );
  };

  const addMaterial = () => {
    if (materials.length >= 5) return;
    setMaterials((prev) => [...prev, createNewMaterial()]);
  };

  const removeMaterial = (id: string) => {
    setMaterials((prev) => prev.filter((m) => m.id !== id));
  };

  const clearAll = () => {
    localStorage.removeItem("slagBlendingState");
    setSpecName("HMS-25");
    setMaterials([createNewMaterial()]);
  };

  // ------------------------------
  // calculations
  // ------------------------------
  const totalRatio = useMemo(
    () => materials.reduce((s, m) => s + Number(m.ratio || 0), 0),
    [materials]
  );

  const selectedSpec = PRODUCT_SPECS[specName];

  const blendedPassing = useMemo(() => {
    if (Math.round(totalRatio * 10) / 10 !== 100) return null;

    const map = new Map<number, number>();
    ALL_SIEVES.forEach((mm) => {
      const v = materials.reduce(
        (sum, m) => sum + (m.ratio / 100) * (m.passingPercentages[mm] || 0),
        0
      );
      map.set(mm, Math.round(v * 10) / 10);
    });
    return map;
  }, [materials, totalRatio]);

  const blendedResults: BlendedSieveResult[] = useMemo(() => {
    if (!blendedPassing) return [];
    return selectedSpec.sieves.map((s) => {
      const p = blendedPassing.get(s.mm) ?? 0;
      return {
        mm: s.mm,
        lower: s.lower,
        upper: s.upper,
        passing: p,
        isOk: p >= s.lower && p <= s.upper,
      };
    });
  }, [blendedPassing, selectedSpec]);

  // ------------------------------
  // render
  // ------------------------------
  return (
    <div className="App">
      <header>
        <h1>鉄鋼スラグ路盤材 配合シミュレーション</h1>
        <div className="storage-buttons">
          <button onClick={clearAll}>データ削除</button>
        </div>
      </header>

      <main>
        {/* 規格選択 */}
        <section className="spec-selection">
          <h2>1. 製品規格の選択</h2>
          <div className="spec-buttons">
            {(Object.keys(PRODUCT_SPECS) as ProductSpecName[]).map((k) => (
              <button
                key={k}
                className={specName === k ? "active" : ""}
                onClick={() => setSpecName(k)}
              >
                {PRODUCT_SPECS[k].name}
              </button>
            ))}
          </div>
        </section>

        {/* 入力（全篩） */}
        <section className="material-input">
          <h2>2. 原料の粒度と配合率を入力（全篩）</h2>

          <button onClick={addMaterial}>
            原料を追加 ({materials.length}/5)
          </button>

          <div className={`total-ratio ${totalRatio !== 100 ? "ratio-error" : ""}`}>
            配合率 合計: {totalRatio.toFixed(1)} %
          </div>

          <table>
            <thead>
              <tr>
                <th>ふるい (mm)</th>
                {materials.map((m) => (
                  <th key={m.id}>
                    <input
                      value={m.name}
                      onChange={(e) =>
                        updateMaterial(m.id, { name: e.target.value })
                      }
                    />
                    <input
                      type="number"
                      value={m.ratio}
                      onChange={(e) =>
                        updateMaterial(m.id, { ratio: Number(e.target.value) })
                      }
                    />
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {ALL_SIEVES_DESC.map((mm) => (
                <tr key={mm}>
                  <td>{mm}</td>
                  {materials.map((m) => (
                    <td key={m.id}>
                      <input
                        type="number"
                        value={m.passingPercentages[mm]}
                        onChange={(e) =>
                          handlePassingChange(m.id, mm, e.target.value)
                        }
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        {/* グラフ */}
        <section className="graph-output">
          <h2>3. 粒度加積曲線</h2>
          <Plot
            data={[
              {
                x: ALL_SIEVES_ASC,
                y: ALL_SIEVES_ASC.map((mm) =>
                  blendedPassing ? blendedPassing.get(mm) : null
                ),
                type: "scatter",
                mode: "lines+markers",
                name: "ブレンド結果",
              },
            ]}
            layout={{
              xaxis: {
                type: "log",
                title: "ふるい目 (mm)",
              },
              yaxis: {
                range: [0, 100],
                title: "通過質量百分率 (%)",
              },
            }}
            style={{ width: "100%", height: "500px" }}
          />
        </section>
      </main>
    </div>
  );
}
