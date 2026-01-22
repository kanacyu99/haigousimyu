import { useState, useEffect, useMemo } from 'react';
import Plot from 'react-plotly.js';
import { PRODUCT_SPECS, ProductSpecName } from './specs';
import { Material, BlendedSieveResult } from './types';
import { v4 as uuidv4 } from 'uuid'; // For unique IDs

// Initial state for a single material
const createNewMaterial = (): Material => {
  const initialPassing: { [sieveSize: number]: number } = {};
  // Initialize with all possible sieve sizes to avoid issues
  const allSieves = new Set<number>();
  Object.values(PRODUCT_SPECS).forEach(spec => {
    spec.sieves.forEach(sieve => allSieves.add(sieve.mm));
  });
  allSieves.forEach(sieve => {
    initialPassing[sieve] = 0;
  });

  return {
    id: uuidv4(),
    name: '新しい原料',
    ratio: 0,
    passingPercentages: initialPassing,
  };
};


function App() {
  // State for selected product specification
  const [specName, setSpecName] = useState<ProductSpecName>('HMS-25');
  // State for the list of raw materials
  const [materials, setMaterials] = useState<Material[]>([createNewMaterial()]);

  // Load state from localStorage on initial render
  useEffect(() => {
    const savedState = localStorage.getItem('slagBlendingState');
    if (savedState) {
      const { specName, materials } = JSON.parse(savedState);
      if (specName && materials) {
        setSpecName(specName);
        setMaterials(materials);
      }
    }
  }, []);

  // Save state to localStorage whenever it changes
  useEffect(() => {
    const stateToSave = JSON.stringify({ specName, materials });
    localStorage.setItem('slagBlendingState', stateToSave);
  }, [specName, materials]);

  const handleClearLocalStorage = () => {
    localStorage.removeItem('slagBlendingState');
    // Reset to initial state
    setSpecName('HMS-25');
    setMaterials([createNewMaterial()]);
  };


  // --- Material Handlers ---
  const addMaterial = () => {
    if (materials.length < 5) {
      setMaterials([...materials, createNewMaterial()]);
    }
  };

  const removeMaterial = (id: string) => {
    setMaterials(materials.filter(m => m.id !== id));
  };

  const updateMaterial = (id: string, field: keyof Material, value: any) => {
    setMaterials(
      materials.map(m => (m.id === id ? { ...m, [field]: value } : m))
    );
  };

  const handlePassingChange = (id: string, sieveMm: number, value: string) => {
    const parsedValue = parseFloat(value);
    if (!isNaN(parsedValue) && parsedValue >= 0 && parsedValue <= 100) {
      setMaterials(
        materials.map(m =>
          m.id === id
            ? {
                ...m,
                passingPercentages: {
                  ...m.passingPercentages,
                  [sieveMm]: parsedValue,
                },
              }
            : m
        )
      );
    }
  };

  // --- Calculations ---
  const totalRatio = useMemo(() => {
    return materials.reduce((sum, m) => sum + Number(m.ratio || 0), 0);
  }, [materials]);

  const selectedSpec = PRODUCT_SPECS[specName];

  const blendedResults: BlendedSieveResult[] = useMemo(() => {
    if (totalRatio !== 100) {
      return [];
    }

    return selectedSpec.sieves.map(sieve => {
      const weightedPassing = materials.reduce((sum, material) => {
        const ratio = Number(material.ratio || 0);
        const passing = Number(material.passingPercentages[sieve.mm] || 0);
        return sum + (ratio / 100) * passing;
      }, 0);

      const roundedPassing = Math.round(weightedPassing * 10) / 10; // Round to one decimal place

      const isOk =
        roundedPassing >= sieve.lower && roundedPassing <= sieve.upper;

      return {
        ...sieve,
        passing: roundedPassing,
        isOk,
      };
    });
  }, [materials, selectedSpec, totalRatio]);

  // --- Rendering ---
  return (
    <div style={{ fontFamily: 'sans-serif', padding: '1rem' }}>
      <h1>鉄鋼スラグ路盤材 配合シミュレーション</h1>

      {/* Placeholder for UI components to be built in the next step */}
      <div>UI will be implemented here.</div>

    </div>
  );
}

export default App;
