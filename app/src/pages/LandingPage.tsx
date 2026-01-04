import { useMemo } from 'react';
import { Link, useNavigate } from 'react-router';
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
import { useBearFilter } from '../hooks/useBearFilter';
import { useBearStats } from '../hooks/useBearStats';
import { useIsMobile } from '../hooks/useIsMobile';
import {
  calculateSummary,
  countByHour,
  countByMonth,
  countBySituation,
  countByWard,
  countByWeekday,
  formatMonthLabel,
} from '../utils/statsCalculator';

const ACCENT = '#a1785b';

// 状況タイプ別の配色（茶色ベース、ダーク背景に映える）
const SITUATION_COLORS: Record<string, string> = {
  ヒグマ確認: '#a1785b', // 茶色（メインテーマ）
  痕跡: '#7c9473', // 緑系（自然の痕跡）
  その他: '#8b7da8', // 紫グレー
};

export function LandingPage() {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { sightings } = useBearStats();
  const { filters, filtered, toggleMonth, toggleWard, clearFilters, hasActiveFilters } =
    useBearFilter(sightings);

  // 月オプションを算出
  const monthOptions = useMemo(() => {
    const monthSet = new Set<string>();
    for (const s of sightings) {
      const month = s.properties.date.substring(0, 7);
      monthSet.add(month);
    }
    return Array.from(monthSet).sort();
  }, [sightings]);

  // 区オプションを算出
  const wardOptions = useMemo(() => {
    const wardSet = new Set<string>();
    for (const s of sightings) {
      wardSet.add(s.properties.ward);
    }
    return Array.from(wardSet).sort();
  }, [sightings]);

  // フィルタ適用後のデータで統計を再計算
  const stats = useMemo(() => {
    return {
      monthly: countByMonth(filtered),
      byWard: countByWard(filtered),
      byHour: countByHour(filtered),
      bySituation: countBySituation(filtered),
      byWeekday: countByWeekday(filtered),
      summary: calculateSummary(filtered),
    };
  }, [filtered]);

  const { monthly, byWard, byHour, bySituation, byWeekday, summary } = stats;

  const recentSightings = filtered.slice(0, 6);

  const monthlyData = monthly.map((m) => ({
    ...m,
    label: formatMonthLabel(m.month),
  }));

  return (
    <div style={{ background: '#18181b', color: '#fff', minHeight: 'calc(100vh - 56px)' }}>
      {/* Hero */}
      <section
        style={{
          padding: isMobile ? '48px 16px 40px' : '80px 24px 60px',
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
          札幌市ヒグマ出没3Dマップ
        </h1>
        <p style={{ fontSize: '15px', color: '#888', lineHeight: 1.8, marginBottom: '32px' }}>
          ヒグマ出没データを統計・分析して可視化。
          <br />
          出没の傾向とパターンを把握できます。
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
      <section
        style={{
          padding: isMobile ? '0 16px 40px' : '0 24px 60px',
          maxWidth: '800px',
          margin: '0 auto',
        }}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: isMobile
              ? 'repeat(2, 1fr)'
              : 'repeat(auto-fit, minmax(140px, 1fr))',
            gap: '1px',
            background: '#27272a',
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
              style={{ background: '#1f1f23', padding: '24px 16px', textAlign: 'center' }}
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

      {/* Filter */}
      <section
        style={{
          padding: isMobile ? '0 16px 32px' : '0 24px 40px',
          maxWidth: '800px',
          margin: '0 auto',
        }}
      >
        <div style={{ background: '#1f1f23', borderRadius: '8px', padding: '20px' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '16px',
            }}
          >
            <h3
              style={{
                fontSize: '12px',
                color: '#666',
                letterSpacing: '0.05em',
              }}
            >
              フィルタ
              {hasActiveFilters && (
                <span style={{ color: ACCENT, marginLeft: '8px' }}>
                  ({filtered.length}/{sightings.length}件)
                </span>
              )}
            </h3>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={clearFilters}
                style={{
                  background: 'transparent',
                  border: '1px solid #333',
                  color: '#888',
                  padding: '4px 12px',
                  borderRadius: '4px',
                  fontSize: '11px',
                  cursor: 'pointer',
                }}
              >
                クリア
              </button>
            )}
          </div>

          {/* Month Filter */}
          <div style={{ marginBottom: '12px' }}>
            <div style={{ fontSize: '11px', color: '#555', marginBottom: '8px' }}>月</div>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {monthOptions.map((month) => (
                <button
                  key={month}
                  type="button"
                  onClick={() => toggleMonth(month)}
                  style={{
                    background: filters.months.includes(month) ? ACCENT : '#222',
                    border: 'none',
                    color: filters.months.includes(month) ? '#fff' : '#888',
                    padding: '6px 12px',
                    borderRadius: '4px',
                    fontSize: '12px',
                    cursor: 'pointer',
                  }}
                >
                  {formatMonthLabel(month)}
                </button>
              ))}
            </div>
          </div>

          {/* Ward Filter */}
          <div>
            <div style={{ fontSize: '11px', color: '#555', marginBottom: '8px' }}>区</div>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {wardOptions.map((ward) => (
                <button
                  key={ward}
                  type="button"
                  onClick={() => toggleWard(ward)}
                  style={{
                    background: filters.wards.includes(ward) ? ACCENT : '#222',
                    border: 'none',
                    color: filters.wards.includes(ward) ? '#fff' : '#888',
                    padding: '6px 12px',
                    borderRadius: '4px',
                    fontSize: '12px',
                    cursor: 'pointer',
                  }}
                >
                  {ward}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Charts */}
      <section
        style={{
          padding: isMobile ? '0 16px 48px' : '0 24px 60px',
          maxWidth: '800px',
          margin: '0 auto',
        }}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: isMobile ? '16px' : '24px',
          }}
        >
          {/* Monthly Chart */}
          <div style={{ background: '#1f1f23', borderRadius: '8px', padding: '24px' }}>
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
                    background: '#27272a',
                    border: 'none',
                    borderRadius: '4px',
                    fontSize: '12px',
                  }}
                  labelStyle={{ color: '#888' }}
                  itemStyle={{ color: '#fff' }}
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
          <div style={{ background: '#1f1f23', borderRadius: '8px', padding: '24px' }}>
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
                    background: '#27272a',
                    border: 'none',
                    borderRadius: '4px',
                    fontSize: '12px',
                  }}
                  labelStyle={{ color: '#888' }}
                  itemStyle={{ color: '#fff' }}
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

        {/* Additional Charts Row */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: isMobile ? '16px' : '24px',
            marginTop: isMobile ? '16px' : '24px',
          }}
        >
          {/* Hourly Chart */}
          <div style={{ background: '#1f1f23', borderRadius: '8px', padding: '24px' }}>
            <h3
              style={{
                fontSize: '12px',
                color: '#666',
                marginBottom: '20px',
                letterSpacing: '0.05em',
              }}
            >
              時間帯別
            </h3>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={byHour} barSize={24}>
                <XAxis
                  dataKey="label"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fill: '#555' }}
                />
                <YAxis hide />
                <Tooltip
                  contentStyle={{
                    background: '#27272a',
                    border: 'none',
                    borderRadius: '4px',
                    fontSize: '12px',
                  }}
                  labelStyle={{ color: '#888' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Bar dataKey="count" radius={[4, 4, 0, 0]} name="件数">
                  {byHour.map((entry) => {
                    const maxCount = Math.max(...byHour.map((h) => h.count));
                    return (
                      <Cell key={entry.hour} fill={entry.count === maxCount ? ACCENT : '#333'} />
                    );
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Situation Chart */}
          <div style={{ background: '#1f1f23', borderRadius: '8px', padding: '24px' }}>
            <h3
              style={{
                fontSize: '12px',
                color: '#666',
                marginBottom: '20px',
                letterSpacing: '0.05em',
              }}
            >
              状況タイプ別
            </h3>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={bySituation} layout="vertical" barSize={16}>
                <XAxis type="number" hide />
                <YAxis
                  type="category"
                  dataKey="category"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: '#888' }}
                  width={80}
                />
                <Tooltip
                  contentStyle={{
                    background: '#27272a',
                    border: 'none',
                    borderRadius: '4px',
                    fontSize: '12px',
                  }}
                  labelStyle={{ color: '#888' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Bar dataKey="count" radius={[0, 4, 4, 0]} name="件数">
                  {bySituation.map((entry) => (
                    <Cell key={entry.category} fill={SITUATION_COLORS[entry.category] || '#333'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Weekday Chart */}
          <div style={{ background: '#1f1f23', borderRadius: '8px', padding: '24px' }}>
            <h3
              style={{
                fontSize: '12px',
                color: '#666',
                marginBottom: '20px',
                letterSpacing: '0.05em',
              }}
            >
              曜日別
            </h3>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={byWeekday} barSize={24}>
                <XAxis
                  dataKey="label"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fill: '#555' }}
                />
                <YAxis hide />
                <Tooltip
                  contentStyle={{
                    background: '#27272a',
                    border: 'none',
                    borderRadius: '4px',
                    fontSize: '12px',
                  }}
                  labelStyle={{ color: '#888' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Bar dataKey="count" radius={[4, 4, 0, 0]} name="件数">
                  {byWeekday.map((entry) => (
                    <Cell
                      key={entry.label}
                      fill={entry.weekday === 0 || entry.weekday === 6 ? '#f59e0b' : '#333'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      {/* Recent List */}
      <section
        style={{
          padding: isMobile ? '0 16px 60px' : '0 24px 80px',
          maxWidth: '800px',
          margin: '0 auto',
        }}
      >
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
        <div style={{ background: '#1f1f23', borderRadius: '8px', overflow: 'hidden' }}>
          {recentSightings.map((sighting, index) => {
            const { date, time, ward, location } = sighting.properties;
            const [lng, lat] = sighting.geometry.coordinates;
            // モバイル用に日付を短縮 (2025-01-04 → 1/4)
            const shortDate = (() => {
              const [, m, d] = date.split('-');
              return `${Number.parseInt(m, 10)}/${Number.parseInt(d, 10)}`;
            })();
            return (
              <button
                type="button"
                key={`${date}-${time}-${location}`}
                onClick={() => navigate(`/map?lat=${lat}&lng=${lng}`)}
                style={{
                  display: 'flex',
                  flexDirection: isMobile ? 'column' : 'row',
                  alignItems: isMobile ? 'flex-start' : 'center',
                  padding: isMobile ? '12px 16px' : '16px 20px',
                  borderBottom: index < recentSightings.length - 1 ? '1px solid #1a1a1a' : 'none',
                  cursor: 'pointer',
                  transition: 'background-color 0.15s',
                  background: 'transparent',
                  border: 'none',
                  width: '100%',
                  textAlign: 'left',
                  gap: isMobile ? '6px' : '0',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#27272a';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                {isMobile ? (
                  <>
                    <div
                      style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%' }}
                    >
                      <div
                        style={{
                          width: '6px',
                          height: '6px',
                          borderRadius: '50%',
                          background: ACCENT,
                          flexShrink: 0,
                        }}
                      />
                      <div
                        style={{
                          fontSize: '13px',
                          color: '#ccc',
                          flex: 1,
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {location}
                      </div>
                      <div style={{ fontSize: '12px', color: '#444' }}>→</div>
                    </div>
                    <div style={{ fontSize: '11px', color: '#555', marginLeft: '14px' }}>
                      {ward} · {shortDate}
                    </div>
                  </>
                ) : (
                  <>
                    <div
                      style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        background: ACCENT,
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
                    <div
                      style={{ fontSize: '12px', color: '#555', marginLeft: '16px', flexShrink: 0 }}
                    >
                      {ward}
                    </div>
                    <div
                      style={{ fontSize: '11px', color: '#444', marginLeft: '16px', flexShrink: 0 }}
                    >
                      {date}
                    </div>
                    <div style={{ marginLeft: '12px', color: '#444', fontSize: '14px' }}>→</div>
                  </>
                )}
              </button>
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
