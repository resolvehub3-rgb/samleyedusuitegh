import React from 'react';

interface ReportWatermarkProps {
  schoolName?: string;
  logoUrl?: string | null;
}

/**
 * Professional tiled watermark for report cards.
 * Uses actual repeated SVG elements (not CSS background-image)
 * so it renders reliably in print preview and on paper.
 */
export function ReportWatermark({ schoolName, logoUrl }: ReportWatermarkProps) {
  const displayName = schoolName || 'SCHOOL';

  // Generate a grid of watermark tiles that cover the entire page
  // 5 columns × 6 rows = 30 tiles — enough to cover A4 at any zoom
  const cols = 5;
  const rows = 6;
  const tileW = 320;
  const tileH = 200;

  const tiles: React.ReactNode[] = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      tiles.push(
        <svg
          key={`${r}-${c}`}
          xmlns="http://www.w3.org/2000/svg"
          width={tileW}
          height={tileH}
          viewBox={`0 0 ${tileW} ${tileH}`}
          style={{
            position: 'absolute',
            left: c * tileW,
            top: r * tileH,
            pointerEvents: 'none',
            userSelect: 'none',
          }}
        >
          <g transform="rotate(-25, 160, 100)">
            {logoUrl && (
              <image
                href={logoUrl}
                x="130"
                y="15"
                width="60"
                height="60"
                style={{ opacity: 0.06, filter: 'grayscale(100%)' }}
                preserveAspectRatio="xMidYMid meet"
              />
            )}
            <text
              x="160"
              y={logoUrl ? '110' : '85'}
              textAnchor="middle"
              fontSize="16"
              fontWeight="800"
              fontFamily="'Montserrat', 'Segoe UI', system-ui, sans-serif"
              textTransform="uppercase"
              letterSpacing="0.15em"
              fill="#1e293b"
              style={{ opacity: 0.045 }}
            >
              {displayName}
            </text>
            <text
              x="160"
              y={logoUrl ? '133' : '108'}
              textAnchor="middle"
              fontSize="9"
              fontWeight="600"
              fontFamily="'Montserrat', 'Segoe UI', system-ui, sans-serif"
              textTransform="uppercase"
              letterSpacing="0.2em"
              fill="#1e293b"
              style={{ opacity: 0.03 }}
            >
              OFFICIAL DOCUMENT
            </text>
          </g>
        </svg>
      );
    }
  }

  return (
    <div
      aria-hidden="true"
      className="report-watermark-container"
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: cols * tileW,
        height: rows * tileH,
        overflow: 'hidden',
        pointerEvents: 'none',
        zIndex: 0,
        userSelect: 'none',
      }}
    >
      {tiles}
    </div>
  );
}
