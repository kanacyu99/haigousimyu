import { useEffect, useMemo, useState } from "react";
import Plot from "react-plotly.js";
import { v4 as uuidv4 } from "uuid";

import {
  PRODUCT_SPECS,
  ProductSpecName,
  SPEC_OPTIONS,
  isValidSpecName,
  ALL_SIEVES_MM,
} from "./specs";
import { Material, BlendedSieveResult } from "./types";

// ------------------------------
// utils
// ------------------------------
const normMm = (x: number) => Number(x.toFixed(3));

const ALL_SIEVES = ALL_SIEVES_MM.map(normMm);

// 旧データ/不足キーを補完して安全化
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

const createNewMaterial = (): Material => {
  const passing: Record<number, number> = {};
  for (const mm of ALL_SIEVES) passing[mm] = 0;

  return {
    id: uuidv4(),
    name: "新しい原料",
    ratio: 0,
    passingPercentages: passing,
  };
};

export default function App() {
  // ------------------------------
  // state
  // ------------------------------
  const [specName, setSpecName] = useState<ProductSpecName>("HMS-25");
  const [materials, setMaterials] = useState<Material[]>([createNewMaterial()]);

  // ------------------------------
  // localStorage load (safe)
  // ------------------------------
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
    const payload = JSON.stringify({ specName, materials });
    localStorage.setItem("slagBlendingState", payload);
  }, [specName, materials]);

  const handleClear = () => {
    localStorage.removeItem("slagBlendingState");
    setSpecName("HMS-25");
    setMaterials([createNewMaterial()]);
  };

  // ------------------------------
  // handlers
  // ------------------------------
  const addMaterial = () => {
    if (materials.length >= 5) return;
    setMaterials((prev) => [...prev, createNewMaterial()]);
  };

  const removeMaterial = (id: string) => {
    setMaterials((prev) => prev.filter((m) => m.id !== id));
  };

  const updateMaterial = (id: string, patch: Partial<Material>) => {
    setMaterials((prev) =>
      prev.map((m) => (m.id === id ? { ...m, ...patch } : m))
    );
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

  // ------------------------------
  // calculations
  // ------------------------------
  const totalRatio = useMemo(
    () => materials.reduce((sum, m) => sum + Number(m.ratio || 0), 0),
    [materials]
  );

  const selectedSpec = PRODUCT_SPECS[specName];

  // 全篩（入力用）でブレンド通過率を計算して保持
  const blendedPassingByMm = useMemo(() => {
    if (Math.round(totalRatio * 10) / 10 !== 100) return null;

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

  // 表示用：規格にある篩だけ結果を出す（下限/上限/判定）
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

  // ------------------------------
  // graph series
  // ------------------------------
  const xAll = ALL_SIEVES;

  const blendedY = xAll.map((mm) => blendedPassingByMm?.get(mm) ?? null);

  // 規格線：規格にない篩は null（線を途切れさせる）
  const specIndex = useMemo(() => {
    return new Map(selectedSpec.sieves.map((s) => [normMm(s.mm), s]));
  }, [selectedSpec]);

  const lowerY = xAll.map((mm) => specIndex.get(mm)?.lower ?? null);
  const upperY = xAll.map((mm) => specIndex.get(mm)?.upper ?? null);

  // ------------------------------
  // UI styles (軽め)
  // ------------------------------
  const cardStyle: React.CSSProperties = {
    border: "1px solid #e5e7eb",
    borderRadius: 10,
    padding: 16,
    background: "#fff",
  };

  const sectionTitle: React.CSSProperties = {
    fontSize: 18,
    fontWeight: 700,
    margin: "0 0 10px",
  };

  const pillBtn = (active: boolean): React.CSSProperties => ({
    padding: "8px 10px",
    borderRadius: 8,
    border: "1px solid " + (active ? "#2563eb" : "#d1d5db"),
    background: active ? "#2563eb" : "#f3f4f6",
    color: active ? "#fff" : "#111827",
    cursor: "pointer",
    fontSize: 13,
    fontWeight: 600,
    whiteSpace: "nowrap",
  });

  // ------------------------------
  // render
  // ------------------------------
  return (
    <div style={{ fontFamily: "sans-serif", padding: 18, background: "#f6f7fb" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <h1 style={{ margin: 0, fontSize: 22 }}>鉄鋼スラグ路盤材 配合シミュレーション v999</h1>
        <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
          <button onClick={() => window.location.reload()} style={pillBtn(false)}>
            再読込
          </button>
          <button onClick={handleClear} style={pillBtn(false)}>
            データ削除
          </button>
        </div>
      </div>

      {/* 1 規格選択 */}
      <div style={{ ...cardStyle, marginTop: 14 }}>
        <div style={sectionTitle}>1. 製品規格の選択</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {SPEC_OPTIONS.map((opt) => (
            <button
              key={opt.id}
              onClick={() => setSpecName(opt.id)}
              style={pillBtn(specName === opt.id)}
              title={opt.id}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* 2 入力 */}
      <div style={{ ...cardStyle, marginTop: 14 }}>
        <div style={sectionTitle}>2. 原料の粒度と配合率を入力（入力は全篩表示）</div>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button onClick={addMaterial} style={pillBtn(false)}>
            原料を追加（{materials.length}/5）
          </button>

          <div style={{ marginLeft: "auto", fontWeight: 700 }}>
            配合率 合計: {Math.round(totalRatio * 10) / 10} %
            {Math.round(totalRatio * 10) / 10 !== 100 && (
              <span style={{ color: "#dc2626", marginLeft: 8 }}>
                （合計が100%ではありません）
              </span>
            )}
          </div>
        </div>

        <div style={{ overflowX: "auto", marginTop: 10 }}>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              minWidth: 900,
              background: "#fff",
            }}
          >
            <thead>
              <tr style={{ background: "#f3f4f6" }}>
                <th style={{ border: "1px solid #e5e7eb", padding: 8 }}>ふるい(mm)</th>
                {materials.map((m, idx) => (
                  <th key={m.id} style={{ border: "1px solid #e5e7eb", padding: 8 }}>
                    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                      <input
                        value={m.name}
                        onChange={(e) => updateMaterial(m.id, { name: e.target.value })}
                        style={{
                          width: 240,
                          padding: "6px 8px",
                          border: "1px solid #d1d5db",
                          borderRadius: 6,
                        }}
                      />
                      <button
                        onClick={() => removeMaterial(m.id)}
                        style={{
                          padding: "6px 10px",
                          borderRadius: 6,
                          border: "1px solid #ef4444",
                          background: "#ef4444",
                          color: "#fff",
                          cursor: "pointer",
                          fontWeight: 700,
                        }}
                        title="この原料を削除"
                      >
                        削除
                      </button>
                    </div>
                    <div style={{ marginTop: 8, display: "flex", gap: 8, alignItems: "center" }}>
                      <div style={{ fontSize: 12, color: "#374151" }}>配合率(%)</div>
                      <input
                        type="number"
                        value={m.ratio}
                        onChange={(e) => updateMaterial(m.id, { ratio: Number(e.target.value) })}
                        style={{
                          width: 110,
                          padding: "6px 8px",
                          border: "1px solid #d1d5db",
                          borderRadius: 6,
                        }}
                      />
                    </div>
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {xAll.map((mm) => (
                <tr key={mm}>
                  <td style={{ border: "1px solid #e5e7eb", padding: 8, fontWeight: 700 }}>
                    {mm}
                  </td>
                  {materials.map((m) => (
                    <td key={m.id} style={{ border: "1px solid #e5e7eb", padding: 8 }}>
                      <input
                        type="number"
                        value={m.passingPercentages[mm] ?? 0}
                        onChange={(e) => handlePassingChange(m.id, mm, e.target.value)}
                        style={{
                          width: "100%",
                          padding: "6px 8px",
                          border: "1px solid #d1d5db",
                          borderRadius: 6,
                        }}
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div style={{ marginTop: 8, fontSize: 12, color: "#6b7280" }}>
          ※入力欄は全篩を表示します。判定（下限/上限）は選択した規格に存在する篩のみを表示します（表の「—」は判定対象外）。
        </div>
      </div>

      {/* 3 結果（規格篩だけ） */}
      <div style={{ ...cardStyle, marginTop: 14 }}>
        <div style={sectionTitle}>3. ブレンド後の計算結果（規格篩のみ表示）</div>

        {blendedPassingByMm === null ? (
          <div style={{ color: "#dc2626", fontWeight: 700 }}>
            配合率の合計を100%にしてください（現在 {Math.round(totalRatio * 10) / 10}%）
          </div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#f3f4f6" }}>
                <th style={{ border: "1px solid #e5e7eb", padding: 8 }}>ふるい(mm)</th>
                <th style={{ border: "1px solid #e5e7eb", padding: 8 }}>下限</th>
                <th style={{ border: "1px solid #e5e7eb", padding: 8 }}>上限</th>
                <th style={{ border: "1px solid #e5e7eb", padding: 8 }}>計算値</th>
                <th style={{ border: "1px solid #e5e7eb", padding: 8 }}>判定</th>
              </tr>
            </thead>
            <tbody>
              {blendedResultsSpecOnly.map((r) => (
                <tr key={r.mm}>
                  <td style={{ border: "1px solid #e5e7eb", padding: 8 }}>{r.mm}</td>
                  <td style={{ border: "1px solid #e5e7eb", padding: 8 }}>{r.lower}</td>
                  <td style={{ border: "1px solid #e5e7eb", padding: 8 }}>{r.upper}</td>
                  <td style={{ border: "1px solid #e5e7eb", padding: 8 }}>{r.passing}</td>
                  <td
                    style={{
                      border: "1px solid #e5e7eb",
                      padding: 8,
                      fontWeight: 800,
                      color: r.isOk ? "#16a34a" : "#dc2626",
                    }}
                  >
                    {r.isOk ? "OK" : "NG"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* 4 グラフ */}
      <div style={{ ...cardStyle, marginTop: 14 }}>
        <div style={sectionTitle}>4. 粒度加積曲線グラフ</div>

        <Plot
          data={[
            {
              x: xAll,
              y: lowerY,
              name: "下限",
              mode: "lines",
              line: { dash: "dash" },
            },
            {
              x: xAll,
              y: upperY,
              name: "上限",
              mode: "lines",
              line: { dash: "dash" },
            },
            {
              x: xAll,
              y: blendedY,
              name: "ブレンド結果",
              mode: "lines+markers",
            },
          ]}
          layout={{
            xaxis: {
              title: "ふるい(mm)",
              autorange: "reversed",
            },
            yaxis: {
              title: "通過質量百分率(%)",
              range: [0, 100],
            },
            height: 420,
            margin: { l: 55, r: 20, t: 20, b: 55 },
            legend: { orientation: "h" },
          }}
          style={{ width: "100%" }}
          config={{ displayModeBar: false, responsive: true }}
        />
        <div style={{ marginTop: 6, fontSize: 12, color: "#6b7280" }}>
          ※規格に存在しない篩の上下限は表示しないため、下限/上限線はその部分で途切れます。
        </div>
      </div>
    </div>
  );
}
