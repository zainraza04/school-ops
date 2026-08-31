import type { ReactNode } from 'react';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  breadcrumb?: string[];
}

export function PageHeader({
  title,
  subtitle,
  action,
  breadcrumb,
}: PageHeaderProps): ReactNode {
  return (
    <div className="mb-6 space-y-1">
      {breadcrumb && breadcrumb.length > 0 && (
        <p className="text-xs text-muted-foreground">
          {breadcrumb.join(' / ')}
        </p>
      )}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
          )}
        </div>
        {action && (
          <div className="flex shrink-0 flex-wrap items-center gap-2 sm:justify-end">
            {action}
          </div>
        )}
      </div>
    </div>
  );
}
