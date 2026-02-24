import { useEffect, useState } from "react";
import { biGetContacts, biGetReferrers, biGetLenders } from "../../../api/biClient";

export default function BICRM() {
  const [contacts, setContacts] = useState<any[]>([]);
  const [referrers, setReferrers] = useState<any[]>([]);
  const [lenders, setLenders] = useState<any[]>([]);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setContacts(await biGetContacts());
    setReferrers(await biGetReferrers());
    setLenders(await biGetLenders());
  }

  return (
    <div>
      <h2>BI CRM</h2>

      <section>
        <h3>Contacts</h3>
        {contacts.map((c) => (
          <div key={c.id} className="crm-card">
            <strong>{c.full_name}</strong>
            <p>{c.email}</p>
            <p>{c.phone_e164}</p>
          </div>
        ))}
      </section>

      <section>
        <h3>Referrers</h3>
        {referrers.map((r) => (
          <div key={r.id} className="crm-card">
            <strong>{r.full_name}</strong>
            <p>{r.company_name}</p>
            <p>Status: {r.agreement_status}</p>
          </div>
        ))}
      </section>

      <section>
        <h3>Lenders</h3>
        {lenders.map((l) => (
          <div key={l.id} className="crm-card">
            <strong>{l.rep_full_name}</strong>
            <p>{l.company_name}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
