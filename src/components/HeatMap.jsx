export default function HeatMap({ zones = [] }) {
  const W = 220, H = 148;
  return (
    <div className="heatmap-container">
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ display: 'block' }}>
        <defs><filter id="hblur"><feGaussianBlur stdDeviation="9" /></filter></defs>
        <rect width={W} height={H} fill="#1e5c1e" rx="3" />
        {[0,1,2,3,4].map(i => <rect key={i} x={i*44} y={0} width={22} height={H} fill="rgba(0,0,0,0.04)" />)}
        <rect x={4} y={4} width={W-8} height={H-8} fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth={1.5} rx={2} />
        <line x1={W/2} y1={4} x2={W/2} y2={H-4} stroke="rgba(255,255,255,0.5)" strokeWidth={1} />
        <circle cx={W/2} cy={H/2} r={22} fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth={1} />
        <circle cx={W/2} cy={H/2} r={2} fill="rgba(255,255,255,0.7)" />
        <rect x={4} y={H/2-28} width={40} height={56} fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth={1} />
        <rect x={4} y={H/2-14} width={16} height={28} fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth={1} />
        <rect x={W-44} y={H/2-28} width={40} height={56} fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth={1} />
        <rect x={W-20} y={H/2-14} width={16} height={28} fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth={1} />
        <g filter="url(#hblur)">
          {zones.map((z, i) => {
            const x = z.x/100*W, y = z.y/100*H, r = Math.max(18, z.intensity*42);
            const op = 0.3 + z.intensity*0.55;
            const color = z.intensity > 0.7
              ? `rgba(255,50,0,${op})`
              : z.intensity > 0.4
              ? `rgba(255,190,0,${op})`
              : `rgba(0,160,255,${op})`;
            return <circle key={i} cx={x} cy={y} r={r} fill={color} />;
          })}
        </g>
        {zones.filter(z => z.label).map((z, i) => (
          <text key={i} x={z.x/100*W} y={z.y/100*H+4} textAnchor="middle" fontSize={7}
            fill="rgba(255,255,255,0.85)" fontFamily="Inter">{z.label}</text>
        ))}
      </svg>
    </div>
  );
}
