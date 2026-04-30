import { useState } from 'react';
import { Sparkles, ChevronDown, ChevronUp, AlertCircle, Tag, CheckSquare } from 'lucide-react';
import { useAiStore } from '../../store/useAiStore';
import LoadingSpinner from '../common/LoadingSpinner';

interface Props {
  subject: string;
  body: string;
  from?: string[];
}

export default function AiSummaryPanel({ subject, body, from }: Props) {
  const { currentSummary, isSummaryLoading, summarizeEmail, clearSummary } = useAiStore();
  const [isExpanded, setIsExpanded] = useState(true);

  const handleSummarize = () => {
    if (currentSummary) {
      clearSummary();
    } else {
      summarizeEmail(subject, body, from);
    }
  };

  const importanceColors = {
    high: 'text-red-500 bg-red-50',
    medium: 'text-yellow-600 bg-yellow-50',
    low: 'text-green-600 bg-green-50',
  };

  return (
    <div className="mb-4">
      <button
        onClick={handleSummarize}
        className="flex items-center gap-2 text-sm text-qq-blue hover:text-qq-blue-dark transition-colors"
      >
        <Sparkles className="w-4 h-4" />
        {currentSummary ? 'Hide AI Summary' : 'AI Summary'}
      </button>

      {isSummaryLoading && <LoadingSpinner size="sm" />}

      {currentSummary && isExpanded && (
        <div className="mt-3 p-4 bg-gradient-to-r from-qq-blue-light to-white rounded-qq border border-qq-blue/20">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-medium text-qq-text flex items-center gap-1">
              <Sparkles className="w-4 h-4 text-qq-blue" /> AI Analysis
            </h4>
            <button onClick={() => setIsExpanded(!isExpanded)} className="btn-icon">
              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>

          <p className="text-sm text-qq-text mb-3">{currentSummary.summary}</p>

          <div className="flex flex-wrap gap-2 mb-2">
            <span className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full ${importanceColors[currentSummary.importance]}`}>
              <AlertCircle className="w-3 h-3" />
              {currentSummary.importance.charAt(0).toUpperCase() + currentSummary.importance.slice(1)} priority
            </span>
            <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-qq-hover text-qq-text-secondary">
              <Tag className="w-3 h-3" />
              {currentSummary.category}
            </span>
          </div>

          {currentSummary.actionItems.length > 0 && (
            <div className="mt-2">
              <p className="text-xs font-medium text-qq-text-secondary mb-1">Action Items:</p>
              <ul className="space-y-1">
                {currentSummary.actionItems.map((item, i) => (
                  <li key={i} className="flex items-start gap-1 text-sm text-qq-text">
                    <CheckSquare className="w-3 h-3 text-qq-blue mt-0.5 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
