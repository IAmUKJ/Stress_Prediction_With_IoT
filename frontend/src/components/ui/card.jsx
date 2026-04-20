import React from 'react';

export function Card({ className, ...props }) {
  return (
    <div
      className={`rounded-lg border border-slate-200 bg-white shadow-sm ${className || ''}`}
      {...props}
    />
  );
}

export function CardContent({ className, ...props }) {
  return (
    <div
      className={`p-6 ${className || ''}`}
      {...props}
    />
  );
}

export function CardHeader({ className, ...props }) {
  return (
    <div
      className={`flex flex-col space-y-1.5 p-6 ${className || ''}`}
      {...props}
    />
  );
}

export function CardTitle({ className, ...props }) {
  return (
    <h2
      className={`text-2xl font-semibold leading-none tracking-tight ${className || ''}`}
      {...props}
    />
  );
}

export function CardDescription({ className, ...props }) {
  return (
    <p
      className={`text-sm text-slate-500 ${className || ''}`}
      {...props}
    />
  );
}
