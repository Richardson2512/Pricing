import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingStateProps {
  message?: string;
  submessage?: string;
  size?: 'sm' | 'md' | 'lg';
  fullScreen?: boolean;
  showProgress?: boolean;
  progress?: number; // 0-100
}

export function LoadingState({
  message = 'Loading...',
  submessage,
  size = 'md',
  fullScreen = false,
  showProgress = false,
  progress = 0,
}: LoadingStateProps) {
  const sizeClasses = {
    sm: 'w-5 h-5',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
  };

  const content = (
    <div className="flex flex-col items-center justify-center gap-4">
      {/* Spinner */}
      <Loader2 className={`${sizeClasses[size]} text-olive-600 animate-spin`} />

      {/* Message */}
      <div className="text-center">
        <p className={`${textSizeClasses[size]} font-medium text-slate-800`}>
          {message}
        </p>
        {submessage && (
          <p className="text-sm text-slate-600 mt-1">{submessage}</p>
        )}
      </div>

      {/* Progress bar */}
      {showProgress && (
        <div className="w-64 bg-beige-200 rounded-full h-2 overflow-hidden">
          <div
            className="bg-olive-600 h-full transition-all duration-300 ease-out"
            style={{ width: `${Math.min(progress, 100)}%` }}
          />
        </div>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50">
        {content}
      </div>
    );
  }

  return content;
}

/**
 * Inline loading spinner (for buttons, etc.)
 */
export function InlineLoader({ className = '' }: { className?: string }) {
  return <Loader2 className={`animate-spin ${className}`} />;
}

/**
 * Skeleton loader for content placeholders
 */
export function Skeleton({ className = '' }: { className?: string }) {
  return (
    <div
      className={`animate-pulse bg-beige-200 rounded ${className}`}
      aria-label="Loading..."
    />
  );
}

/**
 * Card skeleton for dashboard
 */
export function CardSkeleton() {
  return (
    <div className="bg-white rounded-lg shadow p-6 space-y-4">
      <Skeleton className="h-6 w-3/4" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-5/6" />
      <div className="flex gap-2 mt-4">
        <Skeleton className="h-10 w-24" />
        <Skeleton className="h-10 w-24" />
      </div>
    </div>
  );
}

/**
 * List skeleton for consultation history
 */
export function ListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-white rounded-lg shadow p-4 space-y-2">
          <div className="flex justify-between items-start">
            <Skeleton className="h-5 w-1/3" />
            <Skeleton className="h-4 w-20" />
          </div>
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      ))}
    </div>
  );
}

