import { expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Input } from '../components/Input';

it('toggles each password independently without changing its value or submitting', async () => {
  const user = userEvent.setup();
  const submit = vi.fn((event) => event.preventDefault());
  render(
    <form onSubmit={submit}>
      <Input
        label="New password"
        type="password"
        defaultValue="secret-password"
        error="Example error"
      />
      <Input label="Confirm new password" type="password" />
      <Input label="Email" type="email" />
    </form>,
  );
  const password = screen.getByLabelText('New password');
  expect(password).toHaveAttribute('type', 'password');
  expect(screen.getAllByRole('button')).toHaveLength(2);
  await user.click(screen.getByRole('button', { name: 'Show new password' }));
  expect(password).toHaveAttribute('type', 'text');
  expect(password).toHaveValue('secret-password');
  expect(password).toHaveAccessibleDescription('Example error');
  expect(screen.getByLabelText('Confirm new password')).toHaveAttribute(
    'type',
    'password',
  );
  await user.click(screen.getByRole('button', { name: 'Hide new password' }));
  expect(password).toHaveAttribute('type', 'password');
  expect(submit).not.toHaveBeenCalled();
});

it('disables toggles with their input or enclosing fieldset', () => {
  render(
    <>
      <Input label="Password" type="password" disabled />
      <fieldset disabled>
        <Input label="Old password" type="password" />
      </fieldset>
    </>,
  );
  expect(screen.getByRole('button', { name: 'Show password' })).toBeDisabled();
  expect(
    screen.getByRole('button', { name: 'Show old password' }),
  ).toBeDisabled();
});
