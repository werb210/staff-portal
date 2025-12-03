import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import ApplicationLayout from '../components/application/ApplicationLayout';
import { useApplicationStore } from '../state/applicationStore';

export default function ApplicationPage() {
  const { id } = useParams();
  const load = useApplicationStore((s) => s.load);

  useEffect(() => {
    if (id) load(id);
  }, [id, load]);

  return <ApplicationLayout />;
}
