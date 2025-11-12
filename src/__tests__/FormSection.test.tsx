import '@testing-library/jest-dom/vitest';
import { render, screen } from '@testing-library/react';
import { describe, it } from 'vitest';
import { FormSection } from '../components/Form/FormSection';

describe('FormSection', () => {
  it('renders title and description', () => {
    render(
      <FormSection title="Test Form" description="Helper text">
        <div>Form content</div>
      </FormSection>
    );

    expect(screen.getByRole('heading', { level: 2, name: 'Test Form' })).toBeInTheDocument();
    expect(screen.getByText('Helper text')).toBeInTheDocument();
    expect(screen.getByText('Form content')).toBeInTheDocument();
  });
});
