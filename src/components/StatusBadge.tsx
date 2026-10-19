import React from 'react';
import { CheckCircle2, AlertCircle, Clock } from 'lucide-react';

interface StatusBadgeProps {
  status?: 'paid' | 'pending' | 'partial' | 'active' | 'inactive';
  isPaid?: boolean;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
}

export default function StatusBadge({ status, isPaid, label, size = 'md' }: StatusBadgeProps) {
  const effectiveStatus = status || (isPaid ? 'paid' : 'pending');
  let bg = '';
  let text = '';
  let border = '';
  let icon = null;
  let defaultLabel = '';

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 font-medium',
    md: 'text-sm px-3 py-1 font-semibold',
    lg: 'text-base px-4 py-1.5 font-bold',
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  switch (effectiveStatus) {
    case 'paid':
      bg = 'bg-emerald-100';
      text = 'text-emerald-800';
      border = 'border-emerald-300';
      icon = <CheckCircle2 className={`${iconSizes[size]} text-emerald-600 mr-1.5 flex-shrink-0`} />;
      defaultLabel = 'PAID';
      break;
    case 'pending':
      bg = 'bg-rose-100';
      text = 'text-rose-800';
      border = 'border-rose-300';
      icon = <AlertCircle className={`${iconSizes[size]} text-rose-600 mr-1.5 flex-shrink-0`} />;
      defaultLabel = 'PENDING';
      break;
    case 'partial':
      bg = 'bg-amber-100';
      text = 'text-amber-900';
      border = 'border-amber-300';
      icon = <Clock className={`${iconSizes[size]} text-amber-600 mr-1.5 flex-shrink-0`} />;
      defaultLabel = 'PARTIAL';
      break;
    case 'active':
      bg = 'bg-blue-50';
      text = 'text-blue-700';
      border = 'border-blue-200';
      defaultLabel = 'Active Member';
      break;
    case 'inactive':
      bg = 'bg-gray-100';
      text = 'text-gray-600';
      border = 'border-gray-300';
      defaultLabel = 'Inactive';
      break;
  }

  return (
    <span
      className={`inline-flex items-center rounded-full border shadow-xs ${bg} ${text} ${border} ${sizeClasses[size]}`}
    >
      {icon}
      <span>{label || defaultLabel}</span>
    </span>
  );
}
