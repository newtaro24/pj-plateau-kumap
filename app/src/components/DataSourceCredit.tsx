interface DataSourceCreditProps {
  dataSourceName: string;
  dataSourceUrl: string;
  license: string;
}

export function DataSourceCredit({
  dataSourceName,
  dataSourceUrl,
  license,
}: DataSourceCreditProps) {
  return (
    <div
      style={{
        position: 'absolute',
        bottom: '10px',
        right: '10px',
        background: 'rgba(0, 0, 0, 0.7)',
        color: 'white',
        padding: '8px 12px',
        borderRadius: '4px',
        fontSize: '12px',
        zIndex: 1000,
      }}
    >
      <div>データ提供: 札幌市環境局</div>
      <div style={{ fontSize: '10px', marginTop: '2px' }}>
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
