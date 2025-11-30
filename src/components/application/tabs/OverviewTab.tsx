import React from 'react';
import { useApplicationStore } from '../../../state/applicationStore';

export default function OverviewTab() {
  const app = useApplicationStore((s) => s.application);
  const form = useApplicationStore((s) => s.formData);

  if (!app) return null;

  return (
    <div>
      <h2>Overview</h2>

      <pre>{JSON.stringify(form, null, 2)}</pre>
    </div>
  );
}
