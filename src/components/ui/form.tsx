import * as React from "react";
import { Controller, ControllerProps, FieldPath, FieldValues, FormProvider, useFormContext } from "react-hook-form";
import { cn } from "@/lib/utils";

const Form = FormProvider;

const FormField = <TFieldValues extends FieldValues = FieldValues, TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>>({
  ...props
}: ControllerProps<TFieldValues, TName>) => {
  return <Controller {...props} />;
};

const FormItem = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("space-y-2", className)} {...props} />
));
FormItem.displayName = "FormItem";

const FormLabel = React.forwardRef<HTMLLabelElement, React.LabelHTMLAttributes<HTMLLabelElement>>(({ className, ...props }, ref) => (
  <label ref={ref} className={cn("text-sm font-medium leading-none", className)} {...props} />
));
FormLabel.displayName = "FormLabel";

const FormControl = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(({ className, ...props }, ref) => (
  <input ref={ref} className={cn("w-full rounded-md border px-3 py-2", className)} {...props} />
));
FormControl.displayName = "FormControl";

const FormDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(function FormDescription({
  className,
  ...props
}, ref) {
  return <p ref={ref} className={cn("text-[13px] text-muted-foreground", className)} {...props} />;
});

const FormMessage = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(function FormMessage({
  className,
  children,
  ...props
}, ref) {
  const { formState } = useFormContext();
  const hasError = Boolean(formState.errors);
  return (
    <p ref={ref} className={cn("text-[13px] font-medium text-red-600", className)} {...props}>
      {children || (hasError ? "This field is required" : null)}
    </p>
  );
});

export { Form, FormItem, FormLabel, FormControl, FormDescription, FormMessage, FormField };
