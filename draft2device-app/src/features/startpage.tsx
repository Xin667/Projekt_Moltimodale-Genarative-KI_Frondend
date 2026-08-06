import { Button } from '../components/ui/button';

type StartPageProps = {
  onStart: () => Promise<void>;
  isLoading: boolean;
  error: string | null;
};

export function StartPage({
  onStart,
  isLoading,
  error,
}: StartPageProps) {
  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <section className="w-full max-w-xl text-center">
        <div className="mb-6 border-b border-[#D9D3C7] pb-4">
        <h1 className="font-sans text-xl font-bold tracking-tight text-[#1E2430]">
          Draft<span className="text-[#C46A2B]">2</span>Device
        </h1>
        <p className="text-xs font-mono text-[#5A6172] mt-1">Skizze → Code</p>
      </div>

        <p className="mt-4 text-muted-foreground">
          Erstelle.
        </p>

        <Button
          className="mt-8"
          type="button"
          onClick={onStart}
          disabled={isLoading}
        >
          {isLoading ? 'Anwendung wird gestartet …' : 'Anwendung starten'}
        </Button>

        {error && (
          <p
            role="alert"
            className="mt-4 text-sm text-destructive"
          >
            {error}
          </p>
        )}
      </section>
    </main>
  );
}