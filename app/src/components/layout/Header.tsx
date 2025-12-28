import { NavLink } from 'react-router';

const headerStyle: React.CSSProperties = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  height: '56px',
  backgroundColor: '#1f1f23',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '0 16px',
  zIndex: 1100,
  borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
};

const logoContainerStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
};

const logoStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  color: '#fff',
  textDecoration: 'none',
  fontSize: '15px',
  fontWeight: 600,
  letterSpacing: '-0.01em',
};

const navStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '4px',
  backgroundColor: 'rgba(255, 255, 255, 0.05)',
  padding: '4px',
  borderRadius: '10px',
};

const navLinkStyle = (isActive: boolean): React.CSSProperties => ({
  padding: '8px 16px',
  borderRadius: '6px',
  textDecoration: 'none',
  fontSize: '13px',
  fontWeight: 500,
  transition: 'all 0.15s',
  backgroundColor: isActive ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
  color: isActive ? '#fff' : 'rgba(255, 255, 255, 0.6)',
});

const badgeStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '6px',
  padding: '6px 12px',
  backgroundColor: 'rgba(161, 120, 91, 0.15)',
  color: '#a1785b',
  borderRadius: '6px',
  fontSize: '12px',
  fontWeight: 500,
};

export function Header() {
  return (
    <header style={headerStyle}>
      <div style={logoContainerStyle}>
        <NavLink to="/" style={logoStyle}>
          札幌ヒグママップ
        </NavLink>
      </div>

      <nav style={navStyle}>
        <NavLink to="/" style={({ isActive }) => navLinkStyle(isActive)}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden="true"
            >
              <rect x="3" y="3" width="7" height="9" />
              <rect x="14" y="3" width="7" height="5" />
              <rect x="14" y="12" width="7" height="9" />
              <rect x="3" y="16" width="7" height="5" />
            </svg>
            統計
          </span>
        </NavLink>
        <NavLink to="/map" style={({ isActive }) => navLinkStyle(isActive)}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden="true"
            >
              <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6" />
              <line x1="8" y1="2" x2="8" y2="18" />
              <line x1="16" y1="6" x2="16" y2="22" />
            </svg>
            3Dマップ
          </span>
        </NavLink>
      </nav>

      <div style={badgeStyle}>
        <span
          style={{
            width: '6px',
            height: '6px',
            backgroundColor: '#22c55e',
            borderRadius: '50%',
            animation: 'pulse 2s infinite',
          }}
        />
        PLATEAU 3D都市モデル
      </div>
    </header>
  );
}
