type PageHeaderProps = {
  title: string;
  description?: string;
};

export function PageHeader({ title, description }: PageHeaderProps) {
  return (
    <div className="mb-6 md:mb-8">
      <h1 className="text-2xl font-bold tracking-tight text-on-surface md:text-3xl">
        {title}
      </h1>
      {description ? (
        <p className="mt-1 max-w-2xl text-sm text-on-surface-variant md:text-base">
          {description}
        </p>
      ) : null}
    </div>
  );
}
