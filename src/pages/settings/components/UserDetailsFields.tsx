import Input from "@/components/ui/Input";

type UserDetailsFieldsProps = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  onChange: (updates: { firstName?: string; lastName?: string; email?: string; phone?: string }) => void;
  errors?: { firstName?: string; lastName?: string; email?: string; phone?: string };
  emailDisabled?: boolean;
};

const UserDetailsFields = ({
  firstName,
  lastName,
  email,
  phone,
  onChange,
  errors,
  emailDisabled = false
}: UserDetailsFieldsProps) => (
  <>
    <Input
      label="First name"
      value={firstName}
      onChange={(event) => onChange({ firstName: event.target.value })}
      error={errors?.firstName}
      required
    />
    <Input
      label="Last name"
      value={lastName}
      onChange={(event) => onChange({ lastName: event.target.value })}
      error={errors?.lastName}
      required
    />
    <Input
      label="Phone"
      value={phone}
      onChange={(event) => onChange({ phone: event.target.value })}
      error={errors?.phone}
    />
    <Input
      label="Email"
      type="email"
      value={email}
      onChange={(event) => onChange({ email: event.target.value })}
      disabled={emailDisabled}
      error={errors?.email}
      required
    />
  </>
);

export default UserDetailsFields;
