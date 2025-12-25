import { NavLink } from 'react-router';

const headerStyle: React.CSSProperties = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  height: '56px',
  backgroundColor: '#111',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '0 24px',
  zIndex: 1100,
};

const logoStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  color: '#fff',
  textDecoration: 'none',
  fontSize: '15px',
  fontWeight: 600,
  letterSpacing: '-0.01em',
};

const navStyle: React.CSSProperties = {
  display: 'flex',
  gap: '4px',
};

const linkBaseStyle: React.CSSProperties = {
  padding: '8px 14px',
  borderRadius: '6px',
  textDecoration: 'none',
  fontSize: '13px',
  fontWeight: 500,
  transition: 'background-color 0.15s, color 0.15s',
};

export function Header() {
  return (
    <header style={headerStyle}>
      <NavLink to="/" style={logoStyle}>
        札幌ヒグマ出没マップ
      </NavLink>

      <nav style={navStyle}>
        <NavLink
          to="/"
          style={({ isActive }) => ({
            ...linkBaseStyle,
            backgroundColor: isActive ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
            color: isActive ? '#fff' : 'rgba(255, 255, 255, 0.5)',
          })}
        >
          統計
        </NavLink>
        <NavLink
          to="/map"
          style={({ isActive }) => ({
            ...linkBaseStyle,
            backgroundColor: isActive ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
            color: isActive ? '#fff' : 'rgba(255, 255, 255, 0.5)',
          })}
        >
          マップ
        </NavLink>
      </nav>
    </header>
  );
}
