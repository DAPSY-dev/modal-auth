import { useState } from 'react';

// Validate on blur or submit, then update visible errors as the user edits.
export function useFieldValidation<Field extends string>(
  rules: Record<Field, () => string | undefined>,
) {
  const [touched, setTouched] = useState<Partial<Record<Field, boolean>>>({});
  const [submitted, setSubmitted] = useState(false);

  function field(name: Field) {
    return {
      error: submitted || touched[name] ? rules[name]() : undefined,
      onBlur: () => setTouched((previous) => ({ ...previous, [name]: true })),
    };
  }

  function validate(form: HTMLFormElement) {
    setSubmitted(true);
    const invalidField = (Object.keys(rules) as Field[]).find((name) =>
      rules[name](),
    );
    if (!invalidField) return true;
    const input = form.elements.namedItem(invalidField);
    if (input instanceof HTMLElement) input.focus();
    return false;
  }

  return { field, validate };
}
