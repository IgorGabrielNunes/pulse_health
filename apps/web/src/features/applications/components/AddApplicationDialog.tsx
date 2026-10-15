import { useMutation } from '@apollo/client/react';
import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Button } from '../../../components/Button';
import type { HttpMethod } from '../../../graphql/__generated__/graphql';
import { fieldErrorsOf, messageOf, type FieldErrors } from '../../../lib/graphql-errors';
import { CreateApplicationMutation, DashboardQuery } from '../operations';
import styles from './AddApplicationDialog.module.css';

const INTERVAL_OPTIONS = [
  { seconds: 30, label: '30 seconds' },
  { seconds: 60, label: '1 minute' },
  { seconds: 300, label: '5 minutes' },
  { seconds: 900, label: '15 minutes' },
  { seconds: 3600, label: '1 hour' },
];

interface AddApplicationDialogProps {
  open: boolean;
  onClose: () => void;
}

export function AddApplicationDialog({ open, onClose }: AddApplicationDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);

  const [createApplication, { loading }] = useMutation(CreateApplicationMutation, {
    refetchQueries: [DashboardQuery],
  });

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  const reset = () => {
    formRef.current?.reset();
    setFieldErrors({});
    setFormError(null);
  };

  const close = () => dialogRef.current?.close();

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);

    setFieldErrors({});
    setFormError(null);

    try {
      await createApplication({
        variables: {
          input: {
            name: String(form.get('name')),
            url: String(form.get('url')).trim(),
            method: form.get('method') as HttpMethod,
            expectedStatus: Number(form.get('expectedStatus')),
            checkIntervalSeconds: Number(form.get('checkIntervalSeconds')),
          },
        },
      });
      close();
    } catch (error) {
      const errors = fieldErrorsOf(error);
      setFieldErrors(errors);
      if (Object.keys(errors).length === 0) setFormError(messageOf(error));
    }
  };

  const errorFor = (field: string) =>
    fieldErrors[field] && (
      <span className={styles.fieldError} id={`${field}-error`}>
        {fieldErrors[field]}
      </span>
    );

  return (
    <dialog
      ref={dialogRef}
      className={styles.dialog}
      aria-labelledby="add-service-title"
      onClose={handleClose}
    >
      <form ref={formRef} className={styles.form} onSubmit={handleSubmit} noValidate>
        <header className={styles.header}>
          <h2 id="add-service-title">Add a service</h2>
          <p>Pulse requests this address on a schedule and records how it responds.</p>
        </header>

        <label className={styles.field}>
          <span>Name</span>
          <input
            name="name"
            required
            maxLength={80}
            placeholder="Billing API"
            autoComplete="off"
            aria-invalid={Boolean(fieldErrors.name)}
            aria-describedby={fieldErrors.name ? 'name-error' : undefined}
          />
          {errorFor('name')}
        </label>

        <label className={styles.field}>
          <span>URL</span>
          <input
            name="url"
            type="url"
            required
            placeholder="https://api.example.com/health"
            autoComplete="off"
            inputMode="url"
            aria-invalid={Boolean(fieldErrors.url)}
            aria-describedby={fieldErrors.url ? 'url-error' : undefined}
          />
          {errorFor('url')}
        </label>

        <div className={styles.columns}>
          <label className={styles.field}>
            <span>Check every</span>
            <select name="checkIntervalSeconds" defaultValue={60}>
              {INTERVAL_OPTIONS.map((option) => (
                <option key={option.seconds} value={option.seconds}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label className={styles.field}>
            <span>Method</span>
            <select name="method" defaultValue="GET">
              <option value="GET">GET</option>
              <option value="HEAD">HEAD</option>
            </select>
          </label>

          <label className={styles.field}>
            <span>Expected status</span>
            <input
              name="expectedStatus"
              type="number"
              min={100}
              max={599}
              defaultValue={200}
              aria-invalid={Boolean(fieldErrors.expectedStatus)}
              aria-describedby={fieldErrors.expectedStatus ? 'expectedStatus-error' : undefined}
            />
            {errorFor('expectedStatus')}
          </label>
        </div>

        {formError && (
          <p className={styles.formError} role="alert">
            {formError}
          </p>
        )}

        <footer className={styles.footer}>
          <Button onClick={close}>Cancel</Button>
          <Button type="submit" variant="primary" disabled={loading}>
            {loading ? 'Adding…' : 'Add service'}
          </Button>
        </footer>
      </form>
    </dialog>
  );
}
