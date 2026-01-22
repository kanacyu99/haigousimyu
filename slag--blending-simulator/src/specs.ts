  "RM-40": {
    sieves: [
      { mm: 53.0, lower: 100, upper: 100 },   // ← 5.3 になってたら絶対ここ
      { mm: 37.5, lower: 95,  upper: 100 },
      { mm: 19.0, lower: 60,  upper: 90  },

      // ★ここ：あなたの表に 13.2mm があるなら入れる
      // 例）表が「30～65」なら下をそう直す
      { mm: 13.2, lower: 30,  upper: 65  },

      { mm: 4.75, lower: 30,  upper: 65  },
      { mm: 2.36, lower: 20,  upper: 50  },
      { mm: 0.425, lower: 10, upper: 30  },
      { mm: 0.075, lower: 2,  upper: 10  },
    ],
  },

  "RM-30": {
    sieves: [
      { mm: 37.5, lower: 100, upper: 100 },
      { mm: 31.5, lower: 95,  upper: 100 },  // ← 表に31.5があるタイプなら残す
      { mm: 19.0, lower: 60,  upper: 90  },

      { mm: 13.2, lower: 30,  upper: 65  },

      { mm: 4.75, lower: 30,  upper: 65  },
      { mm: 2.36, lower: 20,  upper: 50  },
      { mm: 0.425, lower: 10, upper: 30  },
      { mm: 0.075, lower: 2,  upper: 10  },
    ],
  },

  "RM-25": {
    sieves: [
      { mm: 31.5, lower: 100, upper: 100 },
      { mm: 26.5, lower: 95,  upper: 100 },
      { mm: 19.0, lower: 55,  upper: 85  },

      { mm: 13.2, lower: 20,  upper: 65  },  // ← 25-0はここがRM-40/30と違うことが多い

      { mm: 4.75, lower: 30,  upper: 65  },
      { mm: 2.36, lower: 20,  upper: 50  },
      { mm: 0.425, lower: 10, upper: 30  },
      { mm: 0.075, lower: 2,  upper: 10  },
    ],
  },
