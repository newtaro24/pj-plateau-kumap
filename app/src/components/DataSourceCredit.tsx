interface DataSourceCreditProps {
  dataSourceName: string;
  dataSourceUrl: string;
  license: string;
}

// モバイル判定
const isMobile = () => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};

export function DataSourceCredit({
  dataSourceName,
  dataSourceUrl,
  license,
}: DataSourceCreditProps) {
  const mobile = isMobile();

  return (
    <div
      style={{
        position: 'absolute',
        bottom: '10px',
        right: '10px',
        background: 'rgba(0, 0, 0, 0.7)',
        color: 'white',
        padding: mobile ? '6px 10px' : '8px 12px',
        borderRadius: '4px',
        fontSize: mobile ? '10px' : '12px',
        zIndex: 1000,
        maxWidth: mobile ? 'calc(100vw - 20px)' : 'none',
      }}
    >
      <div>データ提供: 札幌市環境局</div>
      <div style={{ fontSize: mobile ? '9px' : '10px', marginTop: '2px' }}>
        <a
          href={dataSourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: '#88ccff', textDecoration: 'none' }}
        >
          {dataSourceName}
        </a>{' '}
        ({license})
      </div>
    </div>
  );
}
