import type { ChangeEvent } from 'react';

interface FileUploadProps {
  onSelect: (file: File) => void;
  accept?: string;
}

export const FileUpload = ({ onSelect, accept }: FileUploadProps) => {
  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onSelect(file);
    }
  };

  return <input type="file" accept={accept} onChange={handleChange} />;
};
