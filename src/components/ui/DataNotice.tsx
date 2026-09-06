import { RefreshCw } from 'lucide-react';
import type { DataStatus } from '../../services/seasonStore';
import { fmtClock } from '../../utils/time';
import { SNAPSHOT_LABEL } from '../../constants';

interface Props {
  status: DataStatus;
  fetchedAt: number | null;
  /** True when the hardcoded constants are being shown instead of live data. */
  snapshot?: boolean;
  /** Short message in the component's voice for the unavailable state. */
  unavailableMessage: string;
  onRetry?: () => void;
  className?: string;
}

/**
 * Labels the three non-loading states honestly. Fresh renders nothing. Stale
 * shows the time the data was actually fetched. Unavailable shows a short
 * message and a retry button. A snapshot is always labelled as one.
 */
export default function DataNotice({ status, fetchedAt, snapshot, unavailableMessage, onRetry, className = '' }: Props) {
  if (snapshot) {
    return (
      <div className={`flex items-center justify-between gap-3 flex-wrap border border-dashed border-rule bg-paper-2 px-3 py-2 ${className}`} role="status">
        <span className="label-mono text-ink">{SNAPSHOT_LABEL.toUpperCase()} · LIVE DATA UNAVAILABLE</span>
        {onRetry && <RetryButton onClick={onRetry} />}
      </div>
    );
  }
  if (status === 'stale' && fetchedAt) {
    return (
      <div className={`label-mono ${className}`} role="status">
        DATA FROM {fmtClock(fetchedAt)}
      </div>
    );
  }
  if (status === 'unavailable') {
    return (
      <div className={`flex items-center justify-between gap-3 flex-wrap border border-dashed border-rule bg-paper-2 px-3 py-2 ${className}`} role="status">
        <span className="font-mono text-sm">{unavailableMessage}</span>
        {onRetry && <RetryButton onClick={onRetry} />}
      </div>
    );
  }
  return null;
}

function RetryButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="bg-paper-3 border border-rule px-3 py-1.5 font-mono text-xs btn-press flex items-center gap-2 hover:border-ink"
    >
      <RefreshCw size={12} aria-hidden="true" />
      RETRY NOW
    </button>
  );
}
