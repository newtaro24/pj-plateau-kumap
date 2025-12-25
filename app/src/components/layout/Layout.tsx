import { Outlet } from 'react-router';
import { Header } from './Header';

const layoutStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  minHeight: '100vh',
};

const mainStyle: React.CSSProperties = {
  flex: 1,
  marginTop: '56px',
};

export function Layout() {
  return (
    <div style={layoutStyle}>
      <Header />
      <main style={mainStyle}>
        <Outlet />
      </main>
    </div>
  );
}
