import type { ChangeEvent } from 'react';

interface FileInputProps {
  label: string;
  accept?: string;
  onSelect: (file: File) => void;
}

export const FileInput = ({ label, accept, onSelect }: FileInputProps) => {
  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onSelect(file);
      event.target.value = '';
    }
  };

  return (
    <label className="file-input">
      <span>{label}</span>
      <input type="file" accept={accept} onChange={handleChange} />
    </label>
  );
};
