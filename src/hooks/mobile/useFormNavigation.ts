import { useMemo, useState } from 'react';

export function useFormNavigation(totalSteps: number) {
  const [currentStep, setCurrentStep] = useState(0);

  const goNext = () => setCurrentStep((prev) => Math.min(prev + 1, totalSteps - 1));
  const goPrevious = () => setCurrentStep((prev) => Math.max(prev - 1, 0));
  const reset = () => setCurrentStep(0);

  const progress = useMemo(
    () => ({ current: currentStep + 1, total: totalSteps, percentage: Math.round(((currentStep + 1) / totalSteps) * 100) }),
    [currentStep, totalSteps]
  );

  return { currentStep, goNext, goPrevious, reset, progress };
}
