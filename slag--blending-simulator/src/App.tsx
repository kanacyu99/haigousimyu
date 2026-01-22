import { useState, useEffect, useMemo } from 'react';
import Plot from 'react-plotly.js';
import {
  PRODUCT_SPECS,
  ProductSpecName,
  SPEC_OPTIONS,
  isValidSpecName,
} from './specs';
import { Material, BlendedSieveResult } from './types';
import { v4 as uuidv4 } from 'uuid';

// ------------------------------
// Utility
// ------------------------------
const normMm = (x: number) => Number(x.toFixed(3));

// ------------------------------
// Initial material factory
// ------------------------------
const createNewMaterial = (): Material => {
  const initialPassing: Record<number, number> = {};

  // 全規格に含まれるふるいを初期化（0%）
  const allSieves = new Set<number>();
  Object.values(PRODUCT_SPECS).forEach(spec => {
    spec.sieves.forEach(s => allSieves.add(normMm(s.mm)));
  });

  allSieves.forEach(mm => {
    initialPassing[mm] = 0;
  });

  return {
    id: uuidv4(),
    name: '新しい原料',
    ratio: 0,
    passingPercentages: initialPassing,
  };
};

// ------------------------------
// App
// ------------------------------
function App() {
  // 選択中の規格（IDのみ）
  const [specName, setSpecName] = useState<ProductSpecName>('HMS-25');

  // 原料リスト
  const [materials, setMaterials] = useState<Material[]>([
    createNewMaterial(),
  ]);

  // ------------------------------
  // localStorage 読み込み（安全版）
  // ------------------------------
  useEffect(() => {
    const savedState = localStorage.getItem('slagBlendingState');
    if (!savedState) return;

    try {
      const parsed = JSON.parse(savedState);
      const savedSpecName = parsed?.specName;
      const savedMaterials = parsed?.materials;

      const safeSpecName: ProductSpecName = isValidSpecName(savedSpecName)
        ? savedSpecName
        : 'HMS-25';

      setSpecName(safeSpecName);

      if (Array.isArray(savedMaterials) && savedMaterials.length > 0) {
        setMaterials(savedMaterials);
      } else {
        setMaterials([createNewMaterial()]);
      }
    } catch {
      // 壊れていたら初期化
      setSpecName('HMS-25');
      setMaterials([createNewMaterial()]);
    }
  }, []);

  // ------------------------------
  // localStorage 保存
  // ------------------------------
  useEffect(() => {
    const stateToSave = JSON.stringify({ specName, materials });
    localStorage.setItem('slagBlendingState', stateToSave);
  }, [specName, materials]);

  const handleClearLocalStorage = () => {
    localStorage.removeItem('slagBlendingState');
    setSpecName('HMS-25');
    setMaterials([createNewMaterial()]);
  };

  // ------------------------------
  // Material handlers
  // ------------------------------
  const addMaterial = () => {
    if (materials.length < 5) {
      setMaterials([...materials, createNewMaterial()]);
    }
  };

  const removeMaterial = (id: string) => {
    setMaterials(materials.filter(m => m.id !== id));
  };

  const updateMaterial = (
    id: string,
    field: keyof Material,
    value: any
  ) => {
    setMaterials(
      materials.map(m => (m.id === id ? { ...m, [field]: value } : m))
    );
  };

  const handlePassingChange = (
    id: string,
    sieveMm: number,
    value: string
  ) => {
    const parsed = parseFloat(value);
    if (isNaN(parsed) || parsed < 0 || parsed > 100) return;

    const key = normMm(sieveMm);

    setMaterials(
      materials.map(m =>
        m.id === id
          ? {
              ...m,
              passingPercentages: {
                ...m.passingPercentages,
                [key]: parsed,
              },
            }
          : m
      )
    );
  };

  // ------------------------------
  // Calculations
  // ------------------------------
  const totalRatio = useMemo(
    () => materials.reduce((sum, m) => sum + Number(m.ratio || 0), 0),
    [materials]
  );

  const selectedSpec = PRODUCT_SPECS[specName];

  const blendedResults: BlendedSieveResult[] = useMemo(() => {
    if (totalRatio !== 100) return [];

    return selectedSpec.sieves.map(sieve => {
      const mm = normMm(sieve.mm);

      const weightedPassing = materials.reduce((sum, material) => {
        const ratio = Number(material.ratio || 0);
        const passing = Number(material.passingPercentages[mm] || 0);
        return sum + (ratio / 100) * passing;
      }, 0);

      const passing = Math.round(weightedPassing * 10) / 10;

      return {
        mm,
        lower: sieve.lower,
        upper: sieve.upper,
        passing,
        isOk: passing >= sieve.lower && passing <= sieve.upper,
      };
    });
  }, [materials, selectedSpec, totalRatio]);

  // ------------------------------
  // Graph data
  // ------------------------------
  const x = selectedSpec.sieves.map(s => normMm(s.mm));

  const lowerLine = selectedSpec.sieves.map(s => s.lower);
  const upperLine = selectedSpec.sieves.map(s => s.upper);
  const blendedLine = blendedResults.map(r => r.passing);

  // ------------------------------
  // Render
  // ------------------------------
  return (
    <div style={{ fontFamily: 'sans-serif', padding: '1rem' }}>
      <h1>鉄鋼スラグ路盤材 配合シミュレーション</h1>

      {/* 規格選択 */}
      <section>
        <h2>1. 製品規格の選択</h2>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {SPEC_OPTIONS.map(opt => (
            <button
              key={opt.id}
              onClick={() => setSpecName(opt.id)}
              style={{
                padding: '6px 10px',
                background:
                  specName === opt.id ? '#1976d2' : '#e0e0e0',
                color: specName === opt.id ? '#fff' : '#000',
                border: 'none',
                borderRadius: 4,
                cursor: 'pointer',
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </section>

      {/* 原料入力 */}
      <section style={{ marginTop: 24 }}>
        <h2>2. 原料の粒度と配合率入力</h2>
        <button onClick={addMaterial}>原料を追加</button>

        {materials.map(m => (
          <div
            key={m.id}
            style={{
              border: '1px solid #ccc',
              padding: 8,
              marginTop: 8,
            }}
          >
            <input
              value={m.name}
              onChange={e =>
                updateMaterial(m.id, 'name', e.target.value)
              }
              placeholder="原料名"
            />
            <input
              type="number"
              value={m.ratio}
              onChange={e =>
                updateMaterial(m.id, 'ratio', Number(e.target.value))
              }
              placeholder="配合率(%)"
              style={{ marginLeft: 8, width: 100 }}
            />
            <button
              onClick={() => removeMaterial(m.id)}
              style={{ marginLeft: 8 }}
            >
              削除
            </button>

            <div style={{ marginTop: 8 }}>
              {selectedSpec.sieves.map(s => {
                const mm = normMm(s.mm);
                return (
                  <div key={mm}>
                    {mm} mm：
                    <input
                      type="number"
                      value={m.passingPercentages[mm] ?? 0}
                      onChange={e =>
                        handlePassingChange(m.id, mm, e.target.value)
                      }
                      style={{ marginLeft: 4, width: 80 }}
                    />
                    %
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        <div style={{ marginTop: 8 }}>
          配合率合計：{totalRatio.toFixed(1)} %
          {totalRatio !== 100 && (
            <span style={{ color: 'red', marginLeft: 8 }}>
              ※100%にしてください
            </span>
          )}
        </div>

        <button onClick={handleClearLocalStorage} style={{ marginTop: 8 }}>
          データ削除
        </button>
      </section>

      {/* 結果 */}
      <section style={{ marginTop: 24 }}>
        <h2>3. ブレンド後の計算結果</h2>
        {blendedResults.length === 0 ? (
          <p>配合率を100%にしてください</p>
        ) : (
          <table border={1} cellPadding={4}>
            <thead>
              <tr>
                <th>ふるい(mm)</th>
                <th>下限</th>
                <th>上限</th>
                <th>計算値</th>
                <th>判定</th>
              </tr>
            </thead>
            <tbody>
              {blendedResults.map(r => (
                <tr key={r.mm}>
                  <td>{r.mm}</td>
                  <td>{r.lower}</td>
                  <td>{r.upper}</td>
                  <td>{r.passing}</td>
                  <td style={{ color: r.isOk ? 'green' : 'red' }}>
                    {r.isOk ? 'OK' : 'NG'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      {/* グラフ */}
      <section style={{ marginTop: 24 }}>
        <h2>4. 粒度加積曲線グラフ</h2>
        <Plot
          data={[
            {
              x,
              y: lowerLine,
              name: '下限',
              mode: 'lines',
              line: { dash: 'dash' },
            },
            {
              x,
              y: upperLine,
              name: '上限',
              mode: 'lines',
              line: { dash: 'dash' },
            },
            {
              x,
              y: blendedLine,
              name: 'ブレンド結果',
              mode: 'lines+markers',
            },
          ]}
          layout={{
            xaxis: { title: 'ふるい(mm)', autorange: 'reversed' },
            yaxis: { title: '通過質量百分率(%)', range: [0, 100] },
            height: 400,
          }}
        />
      </section>
    </div>
  );
}

export default App;
