import { Link, Outlet } from "react-router-dom";

export default function BISilo(){

  return (
    <div className="min-h-screen bg-brand-bg text-white">

      <header className="bg-brand-bg border-b border-subtle">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-semibold tracking-tight">
            Boreal Insurance – Portal
          </h2>

          <nav className="space-x-6 text-sm text-white/80">
            <Link to="pipeline" className="hover:text-white">Pipeline</Link>
            <Link to="crm" className="hover:text-white">CRM</Link>
            <Link to="reports" className="hover:text-white">Reports</Link>
            <Link to="lender" className="hover:text-white">Lender</Link>
          </nav>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-14 md:py-20">
        <Outlet />
      </main>

    </div>
  );
}
