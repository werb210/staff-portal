import { useParams, useNavigate } from "react-router-dom";
import ContactDrawer from "@/features/crm/contacts/ContactDrawer";

export default function ContactDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  return (
    <ContactDrawer
      contactId={id ?? ""}
      open={true}
      onClose={() => navigate(-1)}
    />
  );
}
