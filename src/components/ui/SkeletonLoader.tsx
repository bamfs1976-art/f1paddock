interface Props {
  type?: 'text' | 'stat' | 'row' | 'card' | 'bar';
  count?: number;
  width?: string;
  height?: string;
}

export default function SkeletonLoader({ type = 'text', count = 1, width, height }: Props) {
  const items = Array.from({ length: count });
  return (
    <div className="space-y-2" aria-hidden="true">
      {items.map((_, i) => {
        if (type === 'stat') {
          return <div key={i} className="bg-paper-3 skeleton-pulse" style={{ width: width || '64px', height: height || '64px' }} />;
        }
        if (type === 'card') {
          return <div key={i} className="bg-paper-3 skeleton-pulse" style={{ width: width || '100%', height: height || '120px' }} />;
        }
        if (type === 'row') {
          return (
            <div key={i} className="flex items-center gap-3">
              <div className="bg-paper-3 skeleton-pulse" style={{ width: '20px', height: '20px' }} />
              <div className="bg-paper-3 skeleton-pulse flex-1" style={{ height: '14px' }} />
              <div className="bg-paper-3 skeleton-pulse" style={{ width: '40px', height: '14px' }} />
            </div>
          );
        }
        if (type === 'bar') {
          return <div key={i} className="bg-paper-3 skeleton-pulse" style={{ width: width || '100%', height: height || '8px' }} />;
        }
        return <div key={i} className="bg-paper-3 skeleton-pulse" style={{ width: width || '100%', height: height || '12px' }} />;
      })}
    </div>
  );
}
