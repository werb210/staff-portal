import { useEffect, useState } from "react";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import AppLoading from "@/components/layout/AppLoading";
import { getMe, updateMe } from "@/api/users";

type ProfileForm = {
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
};

const MyProfile = () => {
  const [form, setForm] = useState<ProfileForm>({
    email: "",
    first_name: "",
    last_name: "",
    phone: ""
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadProfile = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await getMe();
        const { user } = response.data;
        setForm({
          email: user.email ?? "",
          first_name: user.first_name ?? "",
          last_name: user.last_name ?? "",
          phone: user.phone
        });
      } catch (loadError) {
        console.error(loadError);
        setError("Unable to load your profile.");
      } finally {
        setLoading(false);
      }
    };

    void loadProfile();
  }, []);

  const onSave = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError(null);
    setMessage(null);
    try {
      await updateMe({
        email: form.email,
        first_name: form.first_name,
        last_name: form.last_name
      });
      setMessage("Profile saved.");
    } catch (saveError) {
      console.error(saveError);
      setError("Unable to save your profile.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <AppLoading />;
  }

  return (
    <div className="page">
      <Card title="My Profile">
        <form className="settings-panel" onSubmit={onSave}>
          <div className="settings-grid">
            <Input
              label="Email"
              type="email"
              value={form.email}
              onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
            />
            <Input label="Phone" value={form.phone} disabled />
            <Input
              label="First Name"
              value={form.first_name}
              onChange={(event) => setForm((prev) => ({ ...prev, first_name: event.target.value }))}
            />
            <Input
              label="Last Name"
              value={form.last_name}
              onChange={(event) => setForm((prev) => ({ ...prev, last_name: event.target.value }))}
            />
          </div>
          <div className="settings-actions">
            <Button type="submit" disabled={saving}>
              {saving ? "Saving..." : "Save"}
            </Button>
            {message && <span role="status">{message}</span>}
            {error && <span role="alert">{error}</span>}
          </div>
        </form>
      </Card>
    </div>
  );
};

export default MyProfile;
