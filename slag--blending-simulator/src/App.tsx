import { useEffect, useMemo, useState } from 'react';
import Plot from 'react-plotly.js';
import { v4 as uuidv4 } from 'uuid';

import { PRODUCT_SPECS } from './specs';
import type { ProductSpecName } from './specs';
import type { Material, BlendedSieveResult } from './types';
import './App.css';

// ------------------------------
// utils
// ------------------------------
const toNum = (v: any, fallback = 0) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
};

const isValidSpecName = (x: any): x is ProductSpecName => {
  return x && typeof x === 'string' && x in PRODUCT_SPECS;
};

// 全規格に登場する「全篩」(mm) を集約して、小→大にソート
const ALL_SIEVES: number[] = (() => {
  const set = new Set<number>();
  Object.values(PRODUCT_SPECS).forEach(spec => {
    spec.sieves.forEach(s => set.add(Number(s.mm)));
  });
  return Array.from(set).sort((a, b) => a - b); // ★小→大（左が小の思想）
})();

// 旧データ/不足キーを補完して安全化
const hydrateMaterial = (m: any): Material => {
  const rawPassing = (m?.passingPercentages ?? {}) as Record<number, any>;
  const passing: Record<number, number> = {};

  for (const mm of ALL_SIEVES) {
    const v = toNum(rawPassing[mm], 0);
    // 0〜100に寄せる（入力が変でも壊れない）
    passing[mm] = Math.min(100, Math.max(0, v));
  }

  return {
    id: typeof m?.id === 'string' ? m.id : uuidv4(),
    name: typeof m?.name === 'string' ? m.name : '原料',
    ratio: toNum(m?.ratio, 0),
    passingPercentages: passing,
  };
};

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

export default function App() {
  const [specName, setSpecName] = useState<ProductSpecName>('HMS-25');
  const [materials, setMaterials] = useState<Material[]>([createNewMaterial()]);

  // ------------------------------
  // localStorage load (safe)
  // ------------------------------
  useEffect(() => {
    const saved = localStorage.getItem('slagBlendingState');
    if (!saved) return;

    try {
      const parsed = JSON.parse(saved);

      const savedSpec = parsed?.specName;
      const safeSpec: ProductSpecName = isValidSpecName(savedSpec) ? savedSpec : 'HMS-25';
      setSpecName(safeSpec);

      const savedMaterials = parsed?.materials;
      if (Array.isArray(savedMaterials) && savedMaterials.length > 0) {
        setMaterials(savedMaterials.map(hydrateMaterial));
      } else {
        setMaterials([createNewMaterial()]);
      }
    } catch (e) {
      console.error('Failed to load state from localStorage', e);
      localStorage.removeItem('slagBlendingState');
      setSpecName('HMS-25');
      setMaterials([createNewMaterial()]);
    }
  }, []);

  // save
  useEffect(() => {
    try {
      const payload = JSON.stringify({ specName, materials });
      localStorage.setItem('slagBlendingState', payload);
    } catch (e) {
      console.error('Failed to save state to localStorage', e);
    }
  }, [specName, materials]);

  const handleClearLocalStorage = () => {
    localStorage.removeItem('slagBlendingState');
    setSpecName('HMS-25');
    setMaterials([createNewMaterial()]);
  };

  // ------------------------------
  // handlers
  // ------------------------------
  const addMaterial = () => {
    if (materials.length >= 5) return;
    setMaterials(prev => [...prev, createNewMaterial()]);
  };

  const removeMaterial = (id: string) => {
    setMaterials(prev => prev.filter(m => m.id !== id));
  };

  const updateMaterialName = (id: string, name: string) => {
    setMaterials(prev => prev.map(m => (m.id === id ? { ...m, name } : m)));
  };

  const updateMaterialRatio = (id: string, ratioStr: string) => {
    const ratio = toNum(ratioStr, 0);
    setMaterials(prev => prev.map(m => (m.id === id ? { ...m, ratio } : m)));
  };

  const handlePassingChange = (id: string, sieveMm: number, value: string) => {
    const v = toNum(value, 0);
    const clipped = Math.min(100, Math.max(0, v));

    setMaterials(prev =>
      prev.map(m =>
        m.id === id
          ? {
              ...m,
              passingPercentages: {
                ...m.passingPercentages,
                [sieveMm]: clipped,
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
    () => materials.reduce((sum, m) => sum + toNum(m.ratio, 0), 0),
    [materials]
  );

  const selectedSpec = PRODUCT_SPECS[specName];
  const isTotalRatioOk = Math.round(totalRatio * 10) / 10 === 100;

  // 全篩でブレンド通過率を計算
  const blendedPassingByMm = useMemo(() => {
    if (!isTotalRatioOk) return null;

    const map = new Map<number, number>();
    for (const mm of ALL_SIEVES) {
      const weighted = materials.reduce((sum, material) => {
        const ratio = toNum(material.ratio, 0);
        const passing = toNum(material.passingPercentages[mm], 0);
        return sum + (ratio / 100) * passing;
      }, 0);

      map.set(mm, Math.round(weighted * 10) / 10);
    }
    return map;
  }, [materials, isTotalRatioOk]);

  // 表示（判定）用：規格に含まれる篩だけ
  const blendedResultsSpecOnly: BlendedSieveResult[] = useMemo(() => {
    if (!blendedPassingByMm) return [];

    return selectedSpec.sieves.map(s => {
      const mm = Number(s.mm);
      const passing = blendedPassingByMm.get(mm) ?? 0;
      return {
        mm,
        lower: s.lower,
        upper: s.upper,
        passing,
        isOk: passing >= s.lower && passing <= s.upper,
      };
    });
  }, [blendedPassingByMm, selectedSpec]);

  // ------------------------------
  // graph data
  // ------------------------------
  const xAll = ALL_SIEVES; // 小→大（左が小）
  const yBlend = xAll.map(mm => (blendedPassingByMm ? blendedPassingByMm.get(mm) ?? null : null));

  const specIndex = useMemo(() => {
    const m = new Map<number, { lower: number; upper: number }>();
    selectedSpec.sieves.forEach(s => m.set(Number(s.mm), { lower: s.lower, upper: s.upper }));
    return m;
  }, [selectedSpec]);

  const yLower = xAll.map(mm => specIndex.get(mm)?.lower ?? null);
  const yUpper = xAll.map(mm => specIndex.get(mm)?.upper ?? null);

  // tick（小→大）※密ならPlotlyに任せてもOKだけど、見やすさ優先で入れておく
  const tickvals = xAll;
  const ticktext = xAll.map(mm => mm.toString());

  return (
    <div className="App">
      <header>
        <h1>鉄鋼スラグ路盤材 配合シミュレーション</h1>
        <div className="storage-buttons">
          <button onClick={() => setMaterials([...materials])}>再計算</button>
          <button onClick={handleClearLocalStorage}>データ削除</button>
        </div>
      </header>

      <main>
        {/* 1 規格選択 */}
        <section className="spec-selection">
          <h2>1. 製品規格の選択</h2>
          <div className="spec-buttons">
            {Object.keys(PRODUCT_SPECS).map(key => (
              <button
                key={key}
                className={specName === key ? 'active' : ''}
                onClick={() => setSpecName(key as ProductSpecName)}
              >
                {PRODUCT_SPECS[key as ProductSpecName].name}
              </button>
            ))}
          </div>
        </section>

        {/* 2 入力（全篩） */}
        <section className="material-input">
          <h2>2. 原料の粒度と配合率を入力（全篩表示）</h2>

          <div className="material-controls" style={{ gap: 12, alignItems: 'center' }}>
            <button onClick={addMaterial} disabled={materials.length >= 5}>
              原料を追加 ({materials.length}/5)
            </button>

            <div className={`total-ratio ${!isTotalRatioOk ? 'ratio-error' : ''}`}>
              配合率 合計: {totalRatio.toFixed(1)} %
              {!isTotalRatioOk && <span className="error-message"> (合計が100%ではありません)</span>}
            </div>
          </div>

          <div className="materials-table-container">
            <table>
              <thead>
                <tr>
                  <th>ふるい (mm)</th>
                  {materials.map(m => (
                    <th key={m.id}>
                      <input
                        type="text"
                        value={m.name}
                        onChange={e => updateMaterialName(m.id, e.target.value)}
                        className="material-name-input"
                        placeholder="原料名"
                      />
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {xAll.map(mm => (
                  <tr key={mm}>
                    <td>{mm}</td>
                    {materials.map(m => (
                      <td key={m.id}>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          step="0.1"
                          value={m.passingPercentages[mm] ?? ''}
                          onChange={e => handlePassingChange(m.id, mm, e.target.value)}
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>

              <tfoot>
                <tr>
                  <td>配合率 (%)</td>
                  {materials.map(m => (
                    <td key={m.id}>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="0.1"
                        value={m.ratio}
                        onChange={e => updateMaterialRatio(m.id, e.target.value)}
                        className={!isTotalRatioOk ? 'ratio-error' : ''}
                      />
                    </td>
                  ))}
                </tr>
                <tr>
                  <td></td>
                  {materials.map(m => (
                    <td key={m.id} className="remove-button-cell">
                      <button onClick={() => removeMaterial(m.id)} className="remove-material-btn">
                        削除
                      </button>
                    </td>
                  ))}
                </tr>
              </tfoot>
            </table>
          </div>
        </section>

        {/* 3 結果（規格篩のみ） */}
        {isTotalRatioOk && blendedResultsSpecOnly.length > 0 && (
          <>
            <section className="results-output">
              <h2>3. ブレンド後の計算結果（規格篩のみ表示）</h2>
              <table>
                <thead>
                  <tr>
                    <th>ふるい (mm)</th>
                    <th>下限値</th>
                    <th>上限値</th>
                    <th>計算値</th>
                    <th>判定</th>
                  </tr>
                </thead>
                <tbody>
                  {blendedResultsSpecOnly.map(r => (
                    <tr key={r.mm} className={r.isOk ? 'ok' : 'ng'}>
                      <td>{r.mm}</td>
                      <td>{r.lower}</td>
                      <td>{r.upper}</td>
                      <td>{r.passing.toFixed(1)}</td>
                      <td>{r.isOk ? 'OK' : 'NG'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div style={{ fontSize: 12, opacity: 0.8, marginTop: 8 }}>
                ※入力は全篩ですが、判定（OK/NG）は選択した規格に含まれる篩のみで行います。
              </div>
            </section>

            {/* 4 グラフ */}
            <section className="graph-output">
              <h2>4. 粒度加積曲線グラフ（左が小）</h2>
              <Plot
                data={[
                  {
                    x: xAll,
                    y: yLower,
                    type: 'scatter',
                    mode: 'lines',
                    name: '規格下限',
                    line: { dash: 'dash' },
                  },
                  {
                    x: xAll,
                    y: yUpper,
                    type: 'scatter',
                    mode: 'lines',
                    name: '規格上限',
                    line: { dash: 'dash' },
                  },
                  {
                    x: xAll,
                    y: yBlend,
                    type: 'scatter',
                    mode: 'lines+markers',
                    name: 'ブレンド結果',
                  },
                ]}
                layout={{
                  title: { text: `${selectedSpec.name} 粒度加積曲線` },
                  xaxis: {
                    title: { text: 'ふるい目 (mm)' },
                    type: 'log',
                    autorange: true, // ★左が小
                    tickvals,
                    ticktext,
                  },
                  yaxis: {
                    title: { text: '通過質量百分率 (%)' },
                    range: [0, 105],
                  },
                  margin: { l: 50, r: 30, b: 60, t: 50 },
                  legend: { orientation: 'h' },
                }}
                config={{ responsive: true }}
                style={{ width: '100%', height: '520px' }}
              />
              <div style={{ fontSize: 12, opacity: 0.8, marginTop: 8 }}>
                ※規格に存在しない篩は上下限を表示しないため、規格線はその部分で途切れます。
              </div>
            </section>
          </>
        )}
      </main>
    </div>
  );
}
