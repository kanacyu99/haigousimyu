import { useEffect, useMemo, useState } from "react";
import Plot from "react-plotly.js";
import { v4 as uuidv4 } from "uuid";

import {
  PRODUCT_SPECS,
  ProductSpecName,
  ALL_SIEVES_MM,
  isValidSpecName,
} from "./specs";
import type { Material, BlendedSieveResult } from "./types";
import "./App.css";

// 小数誤差対策（0.425 などのキーぶれ防止）
const normMm = (x: number) => Number(x.toFixed(3));
const ALL_SIEVES = ALL_SIEVES_MM.map(normMm);

// 新規原料（全篩キーを必ず持つ）
const createNewMaterial = (): Material => {
  const passing: Record<number, number> = {};
  for (const mm of ALL_SIEVES) passing[mm] = 0;

  return {
    id: uuidv4(),
    name: `原料 ${Math.floor(Math.random() * 100)}`,
    ratio: 0,
    passingPercentages: passing,
  };
};

// localStorageからの復元で不足キーを補う
const hydrateMaterial = (m: any): Material => {
  const passing: Record<number, number> = { ...(m?.passingPercentages ?? {}) };

  for (const mm of ALL_SIEVES) {
    const v = Number(passing[mm] ?? 0);
    passing[mm] = Number.isFinite(v) ? v : 0;
  }

  return {
    id: typeof m?.id === "string" ? m.id : uuidv4(),
    name: typeof m?.name === "string" ? m.name : "原料",
    ratio: Number.isFinite(Number(m?.ratio)) ? Number(m.ratio) : 0,
    passingPercentages: passing,
  };
};

export default function App() {
  const [specName, setSpecName] = useState<ProductSpecName>("HMS-25");
  const [materials, setMaterials] = useState<Material[]>([createNewMaterial()]);

  // load
  useEffect(() => {
    const saved = localStorage.getItem("slagBlendingState");
    if (!saved) return;

    try {
      const parsed = JSON.parse(saved);
      const savedSpec = parsed?.specName;
      const savedMaterials = parsed?.materials;

      const safeSpec: ProductSpecName = isValidSpecName(savedSpec)
        ? savedSpec
        : "HMS-25";
      setSpecName(safeSpec);

      if (Array.isArray(savedMaterials) && savedMaterials.length > 0) {
        setMaterials(savedMaterials.map(hydrateMaterial));
      } else {
        setMaterials([createNewMaterial()]);
      }
    } catch {
      setSpecName("HMS-25");
      setMaterials([createNewMaterial()]);
    }
  }, []);

  // save
  useEffect(() => {
    localStorage.setItem("slagBlendingState", JSON.stringify({ specName, materials }));
  }, [specName, materials]);

  const selectedSpec = PRODUCT_SPECS[specName];

  // handlers
  const addMaterial = () => {
    if (materials.length >= 5) return;
    setMaterials((prev) => [...prev, createNewMaterial()]);
  };

  const removeMaterial = (id: string) => {
    setMaterials((prev) => prev.filter((m) => m.id !== id));
  };

  const updateMaterial = (id: string, patch: Partial<Material>) => {
    setMaterials((prev) => prev.map((m) => (m.id === id ? { ...m, ...patch } : m)));
  };

  const handlePassingChange = (id: string, sieveMm: number, value: string) => {
    const mm = normMm(sieveMm);
    const parsed = Number(value);
    if (!Number.isFinite(parsed)) return;
    if (parsed < 0 || parsed > 100) return;

    setMaterials((prev) =>
      prev.map((m) =>
        m.id === id
          ? {
              ...m,
              passingPercentages: {
                ...m.passingPercentages,
                [mm]: parsed,
              },
            }
          : m
      )
    );
  };

  // calculations
  const totalRatio = useMemo(
    () => materials.reduce((sum, m) => sum + Number(m.ratio || 0), 0),
    [materials]
  );

  // 100%のときだけ計算する（いつもの運用）
  const blendedPassingByMm = useMemo(() => {
    const r = Math.round(totalRatio * 10) / 10;
    if (r !== 100) return null;

    const map = new Map<number, number>();
    for (const mm of ALL_SIEVES) {
      const weighted = materials.reduce((sum, material) => {
        const ratio = Number(material.ratio || 0);
        const passing = Number(material.passingPercentages[mm] || 0);
        return sum + (ratio / 100) * passing;
      }, 0);

      map.set(mm, Math.round(weighted * 10) / 10);
    }
    return map;
  }, [materials, totalRatio]);

  // 規格にある篩だけ判定表を出す
  const blendedResultsSpecOnly: BlendedSieveResult[] = useMemo(() => {
    if (!blendedPassingByMm) return [];

    return selectedSpec.sieves.map((sieve) => {
      const mm = normMm(sieve.mm);
      const passing = blendedPassingByMm.get(mm) ?? 0;

      return {
        mm,
        lower: sieve.lower,
        upper: sieve.upper,
        passing,
        isOk: passing >= sieve.lower && passing <= sieve.upper,
      };
    });
  }, [blendedPassingByMm, selectedSpec]);

  // graph series
  const xAll = ALL_SIEVES; // ★全篩（小→大）で固定
  const blendedY = xAll.map((mm) => blendedPassingByMm?.get(mm) ?? null);

  // 規格線は規格にない篩は null（線を途切れさせる）
  const specIndex = useMemo(
    () => new Map(selectedSpec.sieves.map((s) => [normMm(s.mm), s])),
    [selectedSpec]
  );
  const lowerY = xAll.map((mm) => specIndex.get(mm)?.lower ?? null);
  const upperY = xAll.map((mm) => specIndex.get(mm)?.upper ?? null);

  const isTotalRatioOk = Math.round(totalRatio * 10) / 10 === 100;

  return (
    <div className="App">
      <header>
        <h1>鉄鋼スラグ路盤材 配合シミュレーション</h1>
        <div className="storage-buttons">
          <button onClick={() => window.location.reload()}>再読込</button>
          <button
            onClick={() => {
              localStorage.removeItem("slagBlendingState");
              setSpecName("HMS-25");
              setMaterials([createNewMaterial()]);
            }}
          >
            データ削除
          </button>
        </div>
      </header>

      <main>
        {/* 1 規格選択 */}
        <section className="spec-selection">
          <h2>1. 製品規格の選択</h2>
          <div className="spec-buttons">
            {(Object.keys(PRODUCT_SPECS) as ProductSpecName[]).map((key) => (
              <button
                key={key}
                className={specName === key ? "active" : ""}
                onClick={() => setSpecName(key)}
              >
                {PRODUCT_SPECS[key].name}
              </button>
            ))}
          </div>
        </section>

        {/* 2 入力：★ここが全篩 */}
        <section className="material-input">
          <h2>2. 原料の粒度と配合率を入力（全篩）</h2>

          <div className="materials-table-container">
            <table>
              <thead>
                <tr>
                  <th>ふるい (mm)</th>
                  {materials.map((m) => (
                    <th key={m.id}>
                      <input
                        type="text"
                        value={m.name}
                        onChange={(e) => updateMaterial(m.id, { name: e.target.value })}
                        className="material-name-input"
                        placeholder="原料名"
                      />
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {/* ★選択規格ではなく、全篩で描画 */}
                {ALL_SIEVES.map((mm) => (
                  <tr key={mm}>
                    <td>{mm}</td>
                    {materials.map((m) => (
                      <td key={m.id}>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          step="0.1"
                          value={m.passingPercentages[mm] ?? 0}
                          onChange={(e) => handlePassingChange(m.id, mm, e.target.value)}
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>

              <tfoot>
                <tr>
                  <td>配合率 (%)</td>
                  {materials.map((m) => (
                    <td key={m.id}>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="0.1"
                        value={m.ratio}
                        onChange={(e) =>
                          updateMaterial(m.id, { ratio: Number(e.target.value) || 0 })
                        }
                        className={!isTotalRatioOk ? "ratio-error" : ""}
                      />
                    </td>
                  ))}
                </tr>
                <tr>
                  <td></td>
                  {materials.map((m) => (
                    <td key={m.id} className="remove-button-cell">
                      <button
                        onClick={() => removeMaterial(m.id)}
                        className="remove-material-btn"
                      >
                        削除
                      </button>
                    </td>
                  ))}
                </tr>
              </tfoot>
            </table>
          </div>

          <div className="material-controls">
            <button onClick={addMaterial} disabled={materials.length >= 5}>
              原料を追加 ({materials.length}/5)
            </button>

            <div className={`total-ratio ${!isTotalRatioOk ? "ratio-error" : ""}`}>
              配合率 合計: {(Math.round(totalRatio * 10) / 10).toFixed(1)} %
              {!isTotalRatioOk && (
                <span className="error-message"> (合計が100%ではありません)</span>
              )}
            </div>
          </div>

          <div style={{ fontSize: 12, color: "#6b7280", marginTop: 8 }}>
            ※入力は全篩です。判定（下限/上限）は選択した規格に存在する篩のみ表示します（表の「—」相当）。
          </div>
        </section>

        {/* 3 結果（規格篩のみ） */}
        {isTotalRatioOk && blendedResultsSpecOnly.length > 0 && (
          <>
            <section className="results-output">
              <h2>3. ブレンド後の計算結果（規格篩のみ）</h2>
              <table>
                <thead>
                  <tr>
                    <th>ふるい (mm)</th>
                    <th>下限</th>
                    <th>上限</th>
                    <th>計算値</th>
                    <th>判定</th>
                  </tr>
                </thead>
                <tbody>
                  {blendedResultsSpecOnly.map((r) => (
                    <tr key={r.mm} className={r.isOk ? "ok" : "ng"}>
                      <td>{r.mm}</td>
                      <td>{r.lower}</td>
                      <td>{r.upper}</td>
                      <td>{r.passing.toFixed(1)}</td>
                      <td>{r.isOk ? "OK" : "NG"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>

            {/* 4 グラフ：左が小（0.075→…→53） */}
            <section className="graph-output">
              <h2>4. 粒度加積曲線グラフ</h2>
              <Plot
                data={[
                  {
                    x: xAll,
                    y: lowerY,
                    type: "scatter",
                    mode: "lines+markers",
                    name: "規格下限",
                    line: { dash: "dash" },
                  },
                  {
                    x: xAll,
                    y: upperY,
                    type: "scatter",
                    mode: "lines+markers",
                    name: "規格上限",
                    line: { dash: "dash" },
                  },
                  {
                    x: xAll,
                    y: blendedY,
                    type: "scatter",
                    mode: "lines+markers",
                    name: "ブレンド結果",
                    line: { width: 3 },
                  },
                ]}
                layout={{
                  title: { text: `${selectedSpec.name} 粒度加積曲線` },
                  xaxis: {
                    title: { text: "ふるい目 (mm)" },
                    type: "log",
                    // ★左が小になる（reversedしない）
                    autorange: true,
                    tickvals: xAll,
                    ticktext: xAll.map((v) => v.toString()),
                  },
                  yaxis: {
                    title: { text: "通過質量百分率 (%)" },
                    range: [0, 105],
                  },
                  margin: { l: 55, r: 30, b: 55, t: 50 },
                  legend: { orientation: "h" },
                  height: 520,
                }}
                config={{ responsive: true, displayModeBar: false }}
                style={{ width: "100%", height: "520px" }}
              />
              <div style={{ marginTop: 6, fontSize: 12, color: "#6b7280" }}>
                ※規格に存在しない篩の上下限は null のため、規格線はその部分で途切れます。
              </div>
            </section>
          </>
        )}

        {!isTotalRatioOk && (
          <div style={{ marginTop: 10, color: "#dc2626", fontWeight: 700 }}>
            配合率の合計を100%にしてください（現在 {(Math.round(totalRatio * 10) / 10).toFixed(1)}%）
          </div>
        )}
      </main>
    </div>
  );
}
