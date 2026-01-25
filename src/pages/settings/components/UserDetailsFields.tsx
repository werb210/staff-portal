import Input from "@/components/ui/Input";

type UserDetailsFieldsProps = {
  name: string;
  email: string;
  phone: string;
  onChange: (updates: { name?: string; email?: string; phone?: string }) => void;
  emailDisabled?: boolean;
};

const UserDetailsFields = ({ name, email, phone, onChange, emailDisabled = false }: UserDetailsFieldsProps) => (
  <>
    <Input
      label="Name"
      value={name}
      onChange={(event) => onChange({ name: event.target.value })}
      required
    />
    <Input
      label="Phone"
      value={phone}
      onChange={(event) => onChange({ phone: event.target.value })}
    />
    <Input
      label="Email"
      type="email"
      value={email}
      onChange={(event) => onChange({ email: event.target.value })}
      disabled={emailDisabled}
      required
    />
  </>
);

export default UserDetailsFields;
