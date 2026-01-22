import { useState, useEffect, useMemo } from 'react';
import Plot from 'react-plotly.js';
import { PRODUCT_SPECS } from './specs';
import type { ProductSpecName } from './specs';
import type { Material, BlendedSieveResult } from './types';
import { v4 as uuidv4 } from 'uuid';
import './App.css';


const createNewMaterial = (): Material => {
  const initialPassing: { [sieveSize: number]: number } = {};
  const allSieves = new Set<number>();
  Object.values(PRODUCT_SPECS).forEach(spec => {
    spec.sieves.forEach(sieve => allSieves.add(sieve.mm));
  });
  allSieves.forEach(sieve => {
    initialPassing[sieve] = 0;
  });

  return {
    id: uuidv4(),
    name: `原料 ${Math.floor(Math.random() * 100)}`, // Give a more distinct default name
    ratio: 0,
    passingPercentages: initialPassing,
  };
};

function App() {
  const [specName, setSpecName] = useState<ProductSpecName>('HMS-25');
  const [materials, setMaterials] = useState<Material[]>([createNewMaterial()]);

  useEffect(() => {
    try {
        const savedState = localStorage.getItem('slagBlendingState');
        if (savedState) {
            const { specName, materials } = JSON.parse(savedState);
            if (specName && materials && Array.isArray(materials)) {
                setSpecName(specName);
                setMaterials(materials);
            }
        }
    } catch (error) {
        console.error("Failed to load state from localStorage", error);
        // If loading fails, start fresh
        localStorage.removeItem('slagBlendingState');
    }
  }, []);

  useEffect(() => {
    try {
        const stateToSave = JSON.stringify({ specName, materials });
        localStorage.setItem('slagBlendingState', stateToSave);
    } catch (error) {
        console.error("Failed to save state to localStorage", error);
    }
  }, [specName, materials]);

  const handleClearLocalStorage = () => {
    localStorage.removeItem('slagBlendingState');
    setSpecName('HMS-25');
    setMaterials([createNewMaterial()]);
  };

  const addMaterial = () => {
    if (materials.length < 5) {
      setMaterials([...materials, createNewMaterial()]);
    }
  };

  const removeMaterial = (id: string) => {
    setMaterials(materials.filter(m => m.id !== id));
  };

  const updateMaterialName = (id: string, name: string) => {
     setMaterials(
      materials.map(m => (m.id === id ? { ...m, name } : m))
    );
  };

  const updateMaterialRatio = (id: string, ratioStr: string) => {
    const ratio = parseFloat(ratioStr);
    setMaterials(
      materials.map(m => (m.id === id ? { ...m, ratio: isNaN(ratio) ? 0 : ratio } : m))
    );
  };


  const handlePassingChange = (id: string, sieveMm: number, value: string) => {
    const parsedValue = parseFloat(value);
    setMaterials(
        materials.map(m =>
            m.id === id
                ? {
                    ...m,
                    passingPercentages: {
                        ...m.passingPercentages,
                        [sieveMm]: isNaN(parsedValue) ? 0 : parsedValue,
                    },
                }
                : m
        )
    );
  };

  const totalRatio = useMemo(() => {
    return materials.reduce((sum, m) => sum + Number(m.ratio || 0), 0);
  }, [materials]);

  const selectedSpec = PRODUCT_SPECS[specName];

  const blendedResults: BlendedSieveResult[] = useMemo(() => {
    if (totalRatio === 0) return []; // Avoid calculation if no ratios are set

    return selectedSpec.sieves.map(sieve => {
      const weightedPassing = materials.reduce((sum, material) => {
        const ratio = Number(material.ratio || 0);
        const passing = Number(material.passingPercentages[sieve.mm] || 0);
        // Adjust calculation to be based on the total ratio, not always 100
        return sum + (ratio / totalRatio) * passing;
      }, 0);

      const roundedPassing = Math.round(weightedPassing * 10) / 10;
      const isOk = roundedPassing >= sieve.lower && roundedPassing <= sieve.upper;

      return {
        ...sieve,
        passing: roundedPassing,
        isOk,
      };
    });
  }, [materials, selectedSpec, totalRatio]);

  const isTotalRatioOk = totalRatio === 100;

  return (
    <div className="App">
      <header>
        <h1>鉄鋼スラグ路盤材 配合シミュレーション v999-TEST</h1>
        <div className="storage-buttons">
          <button onClick={() => setMaterials(materials)}>再計算</button> {/* Dummy button to trigger re-render if needed */}
          <button onClick={handleClearLocalStorage}>データ削除</button>
        </div>
      </header>

      <main>
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

        <section className="material-input">
          <h2>2. 原料の粒度と配合率を入力</h2>
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
                {selectedSpec.sieves.map(({ mm }) => (
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
          <div className="material-controls">
            <button onClick={addMaterial} disabled={materials.length >= 5}>
              原料を追加 ({materials.length}/5)
            </button>
            <div className={`total-ratio ${!isTotalRatioOk ? 'ratio-error' : ''}`}>
              配合率 合計: {totalRatio.toFixed(1)} %
              {!isTotalRatioOk && <span className="error-message"> (合計が100%ではありません)</span>}
            </div>
          </div>
        </section>

        {isTotalRatioOk && blendedResults.length > 0 && (
          <>
            <section className="results-output">
              <h2>3. ブレンド後の計算結果</h2>
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
                  {blendedResults.map(result => (
                    <tr key={result.mm} className={result.isOk ? 'ok' : 'ng'}>
                      <td>{result.mm}</td>
                      <td>{result.lower}</td>
                      <td>{result.upper}</td>
                      <td>{result.passing.toFixed(1)}</td>
                      <td>{result.isOk ? 'OK' : 'NG'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>

            <section className="graph-output">
              <h2>4. 粒度加積曲線グラフ</h2>
              <Plot
                data={[
                  {
                    x: blendedResults.map(r => r.mm),
                    y: blendedResults.map(r => r.lower),
                    type: 'scatter',
                    mode: 'lines+markers',
                    name: '規格下限',
                    line: { color: 'blue', dash: 'dash' },
                  },
                  {
                    x: blendedResults.map(r => r.mm),
                    y: blendedResults.map(r => r.upper),
                    type: 'scatter',
                    mode: 'lines+markers',
                    name: '規格上限',
                    line: { color: 'red', dash: 'dash' },
                  },
                  {
                    x: blendedResults.map(r => r.mm),
                    y: blendedResults.map(r => r.passing),
                    type: 'scatter',
                    mode: 'lines+markers',
                    name: 'ブレンド結果',
                    line: { color: 'green', width: 3 },
                  },
                ]}
                layout={{
                  title: { text: `${selectedSpec.name} 粒度加積曲線` },
                  xaxis: {
                    title: { text: 'ふるい目 (mm)' },
                    type: 'log',
                    autorange: 'reversed',
                    tickvals: selectedSpec.sieves.map(s => s.mm),
                    ticktext: selectedSpec.sieves.map(s => s.mm.toString()),
                  },
                  yaxis: {
                    title: { text: '通過質量百分率 (%)' },
                    range: [0, 105],
                  },
                  margin: { l: 50, r: 50, b: 50, t: 50 },
                  legend: {
                    x: 0,
                    y: 1,
                    traceorder: 'normal',
                    font: {
                      family: 'sans-serif',
                      size: 12,
                      color: '#000'
                    },
                    bgcolor: '#E2E2E2',
                    bordercolor: '#FFFFFF',
                    borderwidth: 2
                  }
                }}
                config={{ responsive: true }}
                style={{ width: '100%', height: '500px' }}
              />
            </section>
          </>
        )}
      </main>
    </div>
  );
}

export default App;
