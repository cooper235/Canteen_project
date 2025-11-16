'use client';

interface SentimentBadgeProps {
  sentiment: 'positive' | 'negative' | 'neutral';
  score?: number;
  size?: 'sm' | 'md' | 'lg';
}

export default function SentimentBadge({ sentiment, score, size = 'md' }: SentimentBadgeProps) {
  const getSentimentConfig = () => {
    switch (sentiment) {
      case 'positive':
        return {
          emoji: '😊',
          label: 'Positive',
          bgColor: 'bg-green-100',
          textColor: 'text-green-700',
          borderColor: 'border-green-200'
        };
      case 'negative':
        return {
          emoji: '😢',
          label: 'Negative',
          bgColor: 'bg-red-100',
          textColor: 'text-red-700',
          borderColor: 'border-red-200'
        };
      case 'neutral':
        return {
          emoji: '😐',
          label: 'Neutral',
          bgColor: 'bg-gray-100',
          textColor: 'text-gray-700',
          borderColor: 'border-gray-200'
        };
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'text-xs px-2 py-0.5';
      case 'md':
        return 'text-sm px-3 py-1';
      case 'lg':
        return 'text-base px-4 py-2';
    }
  };

  const config = getSentimentConfig();

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-medium border ${config.bgColor} ${config.textColor} ${config.borderColor} ${getSizeClasses()}`}
    >
      <span>{config.emoji}</span>
      <span>{config.label}</span>
      {score !== undefined && (
        <span className="font-semibold">
          {score > 0 ? '+' : ''}{(score * 100).toFixed(0)}%
        </span>
      )}
    </span>
  );
}
