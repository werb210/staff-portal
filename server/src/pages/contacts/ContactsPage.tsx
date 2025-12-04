import { useQuery } from "@tanstack/react-query";
import { ContactsAPI } from "@/api/contacts";

export default function ContactsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["contacts"],
    queryFn: () => ContactsAPI.list(),
  });

  if (isLoading) return <div>Loading contacts...</div>;

  const contacts = data ?? [];

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">Contacts</h1>
      <table className="min-w-full border bg-white">
        <thead>
          <tr className="bg-gray-100 text-left text-sm">
            <th className="px-3 py-2 border-b">Name</th>
            <th className="px-3 py-2 border-b">Email</th>
            <th className="px-3 py-2 border-b">Company</th>
          </tr>
        </thead>
        <tbody>
          {contacts.map((c: any) => (
            <tr key={c.id} className="text-sm">
              <td className="px-3 py-2 border-b">{c.name}</td>
              <td className="px-3 py-2 border-b">{c.email}</td>
              <td className="px-3 py-2 border-b">{c.companyName}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
