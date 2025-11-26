import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export interface AuthTemplateProps {
  title: React.ReactNode;
  subtitle: React.ReactNode;
  content: React.ReactNode;
  asideContent?: React.ReactNode;
}

export function AuthTemplate({
  title,
  subtitle,
  content,
  asideContent,
}: AuthTemplateProps) {
  return (
    <div className="isolate h-full md:flex md:h-auto md:justify-center md:p-4">
      <Card
        className={cn(
          "relative isolate min-h-full overflow-hidden rounded-none border-none p-8 pt-36 pb-30 shadow-lg",
          "md:min-h-auto md:min-w-sm md:rounded-4xl md:pt-15 md:pr-10 md:pb-8",
        )}
      >
        <span
          aria-hidden
          className="bg-primary absolute top-0 right-0 block size-80 translate-4/7 -translate-y-4/7 rounded-full shadow md:hidden"
        />

        <CardHeader className="px-0 text-center">
          <CardTitle className="text-3xl font-semibold md:text-3xl">
            {title}
          </CardTitle>
          <p className="text-muted-foreground">{subtitle}</p>
        </CardHeader>

        <CardContent className="px-0">{content}</CardContent>
      </Card>
      {asideContent ? <AsideCard>{asideContent}</AsideCard> : null}
    </div>
  );
}

function AsideCard({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "text-background flex items-center justify-center bg-[linear-gradient(135deg,#0201D5_0%,#010080_46.15%,#010080_75%)] shadow-lg shadow-slate-950/30",
        "fixed bottom-0 z-1 -mx-2 flex-row gap-3 rounded-t-4xl p-5 px-6 text-left",
        "md:static md:-ml-4 md:w-sm md:flex-col md:gap-6 md:rounded-4xl md:text-center",
        className,
      )}
    >
      {children}
    </div>
  );
}
