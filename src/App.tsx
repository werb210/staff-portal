function App() {
  return (
    <main className="min-h-screen bg-white text-slate-900">
      <div className="mx-auto flex max-w-3xl flex-col gap-4 px-6 py-12">
        <header>
          <p className="text-sm font-semibold uppercase tracking-wide text-indigo-600">Staff Portal</p>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="mt-2 text-slate-600">
            Welcome to the central dashboard for staff operations. Use the navigation to access contacts, companies, deals,
            applications, documents, search, tags, pipeline, reports, and settings.
          </p>
        </header>
        <section className="rounded-lg border border-slate-200 bg-slate-50 p-6">
          <ul className="list-disc space-y-2 pl-5 text-slate-700">
            <li>Routing, data fetching, and state management libraries are installed.</li>
            <li>Vite with TypeScript powers fast development and builds.</li>
            <li>Tailwind CSS is configured for styling, and shadcn/ui is available for components.</li>
          </ul>
        </section>
      </div>
    </main>
  );
}

export default App;
