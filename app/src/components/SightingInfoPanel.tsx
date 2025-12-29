import { useIsMobile } from '../hooks/useIsMobile';
import type { BearSighting } from '../types';

interface SightingInfoPanelProps {
  sighting: BearSighting | null;
  onClose: () => void;
  totalInWard?: number;
}

const getTimeLabel = (time: string): string => {
  if (!time || time === '不明') return '不明';
  const hour = Number.parseInt(time.split(':')[0], 10);
  if (hour >= 4 && hour < 7) return '早朝';
  if (hour >= 7 && hour < 10) return '朝';
  if (hour >= 10 && hour < 13) return '午前';
  if (hour >= 13 && hour < 16) return '午後';
  if (hour >= 16 && hour < 19) return '夕方';
  if (hour >= 19 && hour < 22) return '夜';
  return '深夜';
};

const getWeekdayLabel = (dateStr: string): string => {
  const weekdays = ['日', '月', '火', '水', '木', '金', '土'];
  const date = new Date(dateStr);
  return `${weekdays[date.getDay()]}曜日`;
};

const panelStyle: React.CSSProperties = {
  position: 'absolute',
  left: '16px',
  top: '16px',
  width: '320px',
  backgroundColor: 'rgba(32, 32, 32, 0.95)',
  borderRadius: '12px',
  color: '#fff',
  zIndex: 1000,
  overflow: 'hidden',
  boxShadow: '0 4px 24px rgba(0, 0, 0, 0.3)',
  backdropFilter: 'blur(8px)',
};

const headerStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '16px',
  borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
};

const titleStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  fontSize: '15px',
  fontWeight: 600,
};

const closeButtonStyle: React.CSSProperties = {
  width: '28px',
  height: '28px',
  backgroundColor: 'rgba(255, 255, 255, 0.2)',
  border: '1px solid rgba(255, 255, 255, 0.3)',
  borderRadius: '6px',
  color: '#fff',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  transition: 'background-color 0.15s',
  fontSize: '18px',
  lineHeight: 1,
};

const contentStyle: React.CSSProperties = {
  padding: '16px',
};

const fieldStyle: React.CSSProperties = {
  marginBottom: '12px',
};

const labelStyle: React.CSSProperties = {
  fontSize: '11px',
  color: 'rgba(255, 255, 255, 0.5)',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
  marginBottom: '4px',
};

const valueStyle: React.CSSProperties = {
  fontSize: '14px',
  color: '#fff',
  lineHeight: 1.5,
};

export function SightingInfoPanel({ sighting, onClose, totalInWard }: SightingInfoPanelProps) {
  const isMobile = useIsMobile();

  if (!sighting) return null;

  const { date, time, ward, location, situation } = sighting.properties;
  const [lon, lat] = sighting.geometry.coordinates;
  const timeLabel = getTimeLabel(time);
  const weekdayLabel = getWeekdayLabel(date);

  const mobilePanelStyle: React.CSSProperties = {
    ...panelStyle,
    left: '8px',
    right: '8px',
    width: 'auto',
    maxWidth: 'calc(100vw - 16px)',
  };

  return (
    <div style={isMobile ? mobilePanelStyle : panelStyle}>
      <div style={headerStyle}>
        <div style={titleStyle}>
          <span>出没情報</span>
        </div>
        <button
          type="button"
          style={closeButtonStyle}
          onClick={onClose}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.3)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
          }}
          aria-label="閉じる"
        >
          ×
        </button>
      </div>
      <div style={contentStyle}>
        <div style={fieldStyle}>
          <div style={labelStyle}>日時</div>
          <div style={valueStyle}>
            {date} ({weekdayLabel}) {time}
            <span
              style={{ color: 'rgba(255, 255, 255, 0.5)', marginLeft: '8px', fontSize: '12px' }}
            >
              {timeLabel}
            </span>
          </div>
        </div>
        <div style={fieldStyle}>
          <div style={labelStyle}>場所</div>
          <div style={valueStyle}>{location}</div>
          <div style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.5)', marginTop: '4px' }}>
            {ward}
            {totalInWard && (
              <span style={{ marginLeft: '8px' }}>(この区での出没: {totalInWard}件)</span>
            )}
          </div>
        </div>
        <div style={fieldStyle}>
          <div style={labelStyle}>状況</div>
          <div style={valueStyle}>{situation}</div>
        </div>
        <div style={fieldStyle}>
          <div style={labelStyle}>座標</div>
          <div
            style={{
              fontSize: '11px',
              color: 'rgba(255, 255, 255, 0.6)',
              fontFamily: 'monospace',
            }}
          >
            {lat.toFixed(5)}, {lon.toFixed(5)}
          </div>
        </div>
      </div>
    </div>
  );
}
