import { Link } from 'react-router';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useBearStats } from '../hooks/useBearStats';
import { formatMonthLabel } from '../utils/statsCalculator';

const ACCENT = '#e53935';

export function LandingPage() {
  const { sightings, monthly, byWard, summary } = useBearStats();

  const recentSightings = sightings.slice(0, 6);

  const monthlyData = monthly.map((m) => ({
    ...m,
    label: formatMonthLabel(m.month),
  }));

  return (
    <div style={{ background: '#0a0a0a', color: '#fff', minHeight: 'calc(100vh - 56px)' }}>
      {/* Hero */}
      <section
        style={{
          padding: '80px 24px 60px',
          maxWidth: '800px',
          margin: '0 auto',
        }}
      >
        <p
          style={{ fontSize: '12px', color: '#555', marginBottom: '20px', letterSpacing: '0.05em' }}
        >
          札幌市オープンデータ × PLATEAU 3D都市モデル
        </p>
        <h1
          style={{
            fontSize: 'clamp(28px, 5vw, 40px)',
            fontWeight: 700,
            lineHeight: 1.3,
            marginBottom: '20px',
            letterSpacing: '-0.02em',
          }}
        >
          札幌市ヒグマ出没マップ
        </h1>
        <p style={{ fontSize: '15px', color: '#888', lineHeight: 1.8, marginBottom: '32px' }}>
          ヒグマ出没地点と周辺の建物分布を3D地図で可視化。
          <br />
          出没エリアの空間的特徴を把握できます。
        </p>
        <Link
          to="/map"
          style={{
            display: 'inline-block',
            padding: '14px 28px',
            background: '#fff',
            color: '#000',
            textDecoration: 'none',
            fontSize: '14px',
            fontWeight: 600,
            borderRadius: '4px',
          }}
        >
          3Dマップを見る
        </Link>
      </section>

      {/* Stats */}
      <section style={{ padding: '0 24px 60px', maxWidth: '800px', margin: '0 auto' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '1px',
            background: '#222',
            borderRadius: '8px',
            overflow: 'hidden',
          }}
        >
          {[
            { value: summary.total, label: '出没件数', unit: '件' },
            { value: summary.thisMonth, label: '今月', unit: '件' },
            { value: summary.topWard, label: '最多エリア', unit: '' },
            { value: `${byWard.length}`, label: '出没区数', unit: '区' },
          ].map((stat) => (
            <div
              key={stat.label}
              style={{ background: '#111', padding: '24px 16px', textAlign: 'center' }}
            >
              <div
                style={{
                  fontSize:
                    typeof stat.value === 'number' || stat.value.length <= 3 ? '28px' : '20px',
                  fontWeight: 700,
                  marginBottom: '8px',
                  color: '#fff',
                }}
              >
                {stat.value}
                {stat.unit && (
                  <span style={{ fontSize: '14px', fontWeight: 400, marginLeft: '2px' }}>
                    {stat.unit}
                  </span>
                )}
              </div>
              <div style={{ fontSize: '11px', color: '#666', letterSpacing: '0.05em' }}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Charts */}
      <section style={{ padding: '0 24px 60px', maxWidth: '800px', margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
          {/* Monthly Chart */}
          <div style={{ background: '#111', borderRadius: '8px', padding: '24px' }}>
            <h3
              style={{
                fontSize: '12px',
                color: '#666',
                marginBottom: '20px',
                letterSpacing: '0.05em',
              }}
            >
              月別推移
            </h3>
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={monthlyData}>
                <defs>
                  <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={ACCENT} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={ACCENT} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="label"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fill: '#555' }}
                />
                <YAxis hide />
                <Tooltip
                  contentStyle={{
                    background: '#1a1a1a',
                    border: 'none',
                    borderRadius: '4px',
                    fontSize: '12px',
                  }}
                  labelStyle={{ color: '#888' }}
                />
                <Area
                  type="monotone"
                  dataKey="count"
                  stroke={ACCENT}
                  strokeWidth={2}
                  fill="url(#colorCount)"
                  name="件数"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Ward Chart */}
          <div style={{ background: '#111', borderRadius: '8px', padding: '24px' }}>
            <h3
              style={{
                fontSize: '12px',
                color: '#666',
                marginBottom: '20px',
                letterSpacing: '0.05em',
              }}
            >
              区別件数
            </h3>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={byWard} layout="vertical" barSize={16}>
                <XAxis type="number" hide />
                <YAxis
                  type="category"
                  dataKey="ward"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: '#888' }}
                  width={50}
                />
                <Tooltip
                  contentStyle={{
                    background: '#1a1a1a',
                    border: 'none',
                    borderRadius: '4px',
                    fontSize: '12px',
                  }}
                  labelStyle={{ color: '#888' }}
                />
                <Bar dataKey="count" radius={[0, 4, 4, 0]} name="件数">
                  {byWard.map((entry, index) => (
                    <Cell key={entry.ward} fill={index === 0 ? ACCENT : '#333'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      {/* Recent List */}
      <section style={{ padding: '0 24px 80px', maxWidth: '800px', margin: '0 auto' }}>
        <h3
          style={{
            fontSize: '12px',
            color: '#666',
            marginBottom: '16px',
            letterSpacing: '0.05em',
          }}
        >
          直近の出没
        </h3>
        <div style={{ background: '#111', borderRadius: '8px', overflow: 'hidden' }}>
          {recentSightings.map((sighting, index) => {
            const { date, time, ward, location, dangerLevel } = sighting.properties;
            return (
              <div
                key={`${date}-${time}-${location}`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '16px 20px',
                  borderBottom: index < recentSightings.length - 1 ? '1px solid #1a1a1a' : 'none',
                }}
              >
                <div
                  style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background:
                      dangerLevel === 'high'
                        ? ACCENT
                        : dangerLevel === 'medium'
                          ? '#f59e0b'
                          : '#22c55e',
                    marginRight: '16px',
                    flexShrink: 0,
                  }}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: '13px',
                      color: '#ccc',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {location}
                  </div>
                </div>
                <div style={{ fontSize: '12px', color: '#555', marginLeft: '16px', flexShrink: 0 }}>
                  {ward}
                </div>
                <div style={{ fontSize: '11px', color: '#444', marginLeft: '16px', flexShrink: 0 }}>
                  {date}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Footer */}
      <footer
        style={{
          padding: '40px 24px',
          borderTop: '1px solid #1a1a1a',
          fontSize: '12px',
          color: '#555',
          textAlign: 'center',
        }}
      >
        <p style={{ marginBottom: '8px' }}>
          データ: 札幌市オープンデータ（CC BY 4.0） / PLATEAU 3D都市モデル
        </p>
        <p>Urban Data Challenge 2025</p>
      </footer>
    </div>
  );
}
