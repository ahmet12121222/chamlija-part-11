type LeafSpec = {
  left: string;
  top: string;
  size: number;
  rotate: number;
  opacity: number;
  fill: string;
  stroke: string;
};

const leaves: LeafSpec[] = [
  { left: "4%", top: "7%", size: 18, rotate: -26, opacity: 0.32, fill: "#80a86a", stroke: "#4c6a43" },
  { left: "12%", top: "15%", size: 22, rotate: 14, opacity: 0.3, fill: "#a8c980", stroke: "#5d794a" },
  { left: "23%", top: "9%", size: 15, rotate: -18, opacity: 0.28, fill: "#8ab56e", stroke: "#4f7247" },
  { left: "31%", top: "17%", size: 24, rotate: 26, opacity: 0.33, fill: "#78a765", stroke: "#456744" },
  { left: "38%", top: "12%", size: 15, rotate: -28, opacity: 0.25, fill: "#d7bf75", stroke: "#7a6c41" },
  { left: "47%", top: "21%", size: 20, rotate: 18, opacity: 0.29, fill: "#6f9c65", stroke: "#496d44" },
  { left: "58%", top: "11%", size: 17, rotate: -12, opacity: 0.28, fill: "#9ec279", stroke: "#537247" },
  { left: "69%", top: "8%", size: 21, rotate: 24, opacity: 0.32, fill: "#7ca566", stroke: "#4a6f46" },
  { left: "79%", top: "17%", size: 17, rotate: -20, opacity: 0.28, fill: "#d6c37d", stroke: "#7d6b40" },
  { left: "88%", top: "11%", size: 18, rotate: 13, opacity: 0.29, fill: "#7ea362", stroke: "#4b6542" },
  { left: "93%", top: "28%", size: 13, rotate: -14, opacity: 0.24, fill: "#e4d48a", stroke: "#7c6d3b" },
  { left: "6%", top: "38%", size: 20, rotate: 23, opacity: 0.29, fill: "#7ca66e", stroke: "#496d44" },
  { left: "15%", top: "50%", size: 14, rotate: -20, opacity: 0.24, fill: "#d7c77a", stroke: "#7b6a3d" },
  { left: "25%", top: "58%", size: 20, rotate: 20, opacity: 0.3, fill: "#8cb86d", stroke: "#4f7146" },
  { left: "35%", top: "46%", size: 23, rotate: -30, opacity: 0.32, fill: "#76a66a", stroke: "#446a46" },
  { left: "42%", top: "64%", size: 16, rotate: 30, opacity: 0.25, fill: "#b3ce86", stroke: "#5f7a49" },
  { left: "53%", top: "53%", size: 18, rotate: -16, opacity: 0.27, fill: "#7aa46d", stroke: "#496d46" },
  { left: "65%", top: "60%", size: 16, rotate: 22, opacity: 0.25, fill: "#d1c179", stroke: "#7c6f3f" },
  { left: "76%", top: "49%", size: 23, rotate: -18, opacity: 0.31, fill: "#7ea670", stroke: "#496d45" },
  { left: "83%", top: "58%", size: 15, rotate: 24, opacity: 0.23, fill: "#a5c984", stroke: "#58774a" },
  { left: "90%", top: "70%", size: 18, rotate: -22, opacity: 0.28, fill: "#8ab26d", stroke: "#4c7345" },
  { left: "4%", top: "76%", size: 16, rotate: 15, opacity: 0.25, fill: "#d9c06c", stroke: "#7c6d41" },
  { left: "18%", top: "81%", size: 20, rotate: -14, opacity: 0.29, fill: "#84a96d", stroke: "#496d43" },
  { left: "28%", top: "88%", size: 14, rotate: 28, opacity: 0.23, fill: "#bed58a", stroke: "#597746" },
  { left: "40%", top: "84%", size: 19, rotate: -28, opacity: 0.28, fill: "#7da670", stroke: "#496d45" },
  { left: "51%", top: "92%", size: 15, rotate: 18, opacity: 0.24, fill: "#d1c078", stroke: "#7c6b3c" },
  { left: "61%", top: "80%", size: 22, rotate: -12, opacity: 0.31, fill: "#7ba863", stroke: "#436442" },
  { left: "70%", top: "88%", size: 16, rotate: 20, opacity: 0.26, fill: "#90b476", stroke: "#526d48" },
  { left: "82%", top: "82%", size: 18, rotate: -30, opacity: 0.29, fill: "#d2c885", stroke: "#7a6c43" },
  { left: "89%", top: "89%", size: 13, rotate: 18, opacity: 0.22, fill: "#8aac69", stroke: "#4e7144" },
  { left: "2%", top: "62%", size: 12, rotate: 10, opacity: 0.2, fill: "#b5c98b", stroke: "#5f7c51" },
  { left: "96%", top: "54%", size: 12, rotate: -6, opacity: 0.21, fill: "#d3c382", stroke: "#7b6a3d" },
  { left: "7%", top: "24%", size: 12, rotate: 12, opacity: 0.18, fill: "#b3c887", stroke: "#5b7a52" },
  { left: "85%", top: "34%", size: 12, rotate: -20, opacity: 0.18, fill: "#d7c67d", stroke: "#7d6f45" },
];

function LeafShape({ fill, stroke, opacity }: { fill: string; stroke: string; opacity: number }) {
  return (
    <svg viewBox="0 0 64 64" aria-hidden="true" className="decorative-leaf-svg" style={{ opacity }}>
      <path d="M32 5C54 16 58 34 52 50C45 58 34 61 22 58C10 54 6 42 8 28C11 17 19 9 32 5Z" fill={fill} stroke={stroke} strokeWidth="1.4" strokeLinejoin="round" />
      <path d="M32 12V52" stroke={stroke} strokeWidth="1.4" strokeLinecap="round" opacity="0.85" />
      <path d="M32 20C27 25 22 30 17 36" stroke={stroke} strokeWidth="1.3" strokeLinecap="round" opacity="0.7" />
      <path d="M32 20C37 25 42 30 47 36" stroke={stroke} strokeWidth="1.3" strokeLinecap="round" opacity="0.7" />
      <path d="M32 28C27 33 22 39 18 44" stroke={stroke} strokeWidth="1.15" strokeLinecap="round" opacity="0.65" />
      <path d="M32 28C37 33 42 39 46 44" stroke={stroke} strokeWidth="1.15" strokeLinecap="round" opacity="0.65" />
    </svg>
  );
}

export function DecorativeLeaves() {
  return (
    <div className="decorative-leaf-layer" aria-hidden="true">
      <svg className="decorative-vine decorative-vine-top-left" viewBox="0 0 220 180" preserveAspectRatio="xMinYMin meet" aria-hidden="true">
        <path d="M26 170 C56 119, 80 90, 95 63 S128 24, 157 18" fill="none" stroke="rgba(72, 101, 70, 0.32)" strokeWidth="2.2" strokeLinecap="round" />
        <path d="M72 140 C88 119, 103 96, 109 72" fill="none" stroke="rgba(90, 126, 80, 0.2)" strokeWidth="1.8" strokeLinecap="round" />
        <path d="M120 92 C139 87, 157 75, 176 58" fill="none" stroke="rgba(90, 126, 80, 0.18)" strokeWidth="1.7" strokeLinecap="round" />
      </svg>

      <svg className="decorative-vine decorative-vine-top-right" viewBox="0 0 220 180" preserveAspectRatio="xMaxYMin meet" aria-hidden="true">
        <path d="M194 170 C162 120, 138 91, 118 65 S92 28, 58 19" fill="none" stroke="rgba(72, 101, 70, 0.28)" strokeWidth="2.2" strokeLinecap="round" />
        <path d="M146 142 C133 120, 121 99, 109 72" fill="none" stroke="rgba(92, 126, 80, 0.18)" strokeWidth="1.8" strokeLinecap="round" />
        <path d="M98 90 C81 86, 65 74, 48 56" fill="none" stroke="rgba(92, 126, 80, 0.16)" strokeWidth="1.7" strokeLinecap="round" />
      </svg>

      <svg className="decorative-vine decorative-vine-bottom-left" viewBox="0 0 220 180" preserveAspectRatio="xMinYMax meet" aria-hidden="true">
        <path d="M36 8 C68 56, 92 90, 99 125 S126 158, 162 170" fill="none" stroke="rgba(72, 101, 70, 0.18)" strokeWidth="2.1" strokeLinecap="round" />
        <path d="M82 32 C93 53, 103 80, 112 109" fill="none" stroke="rgba(90, 126, 80, 0.16)" strokeWidth="1.7" strokeLinecap="round" />
      </svg>

      <svg className="decorative-vine decorative-vine-bottom-right" viewBox="0 0 220 180" preserveAspectRatio="xMaxYMax meet" aria-hidden="true">
        <path d="M184 8 C150 58, 132 89, 120 124 S93 156, 58 170" fill="none" stroke="rgba(72, 101, 70, 0.18)" strokeWidth="2.1" strokeLinecap="round" />
        <path d="M140 30 C128 51, 117 77, 110 108" fill="none" stroke="rgba(90, 126, 80, 0.16)" strokeWidth="1.7" strokeLinecap="round" />
      </svg>

      {leaves.map((leaf, index) => (
        <span
          key={`${leaf.left}-${leaf.top}-${index}`}
          className="decorative-leaf"
          style={{
            left: leaf.left,
            top: leaf.top,
            width: `${leaf.size}px`,
            height: `${leaf.size * 1.32}px`,
            opacity: leaf.opacity,
            transform: `rotate(${leaf.rotate}deg)`,
            animationDelay: `${index * 0.45}s`,
          }}
        >
          <LeafShape fill={leaf.fill} stroke={leaf.stroke} opacity={leaf.opacity} />
        </span>
      ))}
    </div>
  );
}
