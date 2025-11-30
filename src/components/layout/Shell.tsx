import React from 'react';
import { useSiloStore } from '../../state/siloStore';
import './shell.css';

export default function Shell({ children }: { children: React.ReactNode }) {
  const { currentSilo, allowedSilos, setSilo, roles } = useSiloStore();

  return (
    <div className="shell">
      <header className="shell-header">
        <div className="logo">Boreal Staff Portal</div>

        <div className="silo-switch">
          {allowedSilos.map((silo) => (
            <button
              key={silo}
              className={currentSilo === silo ? "active" : ""}
              onClick={() => setSilo(silo)}
            >
              {silo}
            </button>
          ))}
        </div>

        <div className="role">
          Role: {currentSilo && roles[currentSilo]}
        </div>
      </header>

      <main className="shell-main">{children}</main>
    </div>
  );
}
