import { cn } from "@/lib/utils/format";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  description?: string;
}

export function Card({ className, title, description, children, ...props }: CardProps) {
  return (
    <section
      className={cn(
        "rounded-2xl border border-slate-200 bg-white p-5 shadow-card animate-fade-up",
        className,
      )}
      {...props}
    >
      {title ? <h3 className="text-base font-bold text-slate-900">{title}</h3> : null}
      {description ? <p className="mt-1 text-sm text-slate-500">{description}</p> : null}
      {children ? <div className={title || description ? "mt-4" : ""}>{children}</div> : null}
    </section>
  );
}
