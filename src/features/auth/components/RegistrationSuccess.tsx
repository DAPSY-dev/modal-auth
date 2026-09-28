import { Title } from '../../../components/Title';
import { Stack } from '../../../components/Stack';
import { Icon } from '../../../components/Icon';

export function RegistrationSuccess() {
  return (
    <Stack size="l">
      <Title id="auth-title" tabIndex={-1} className="text-center">
        Registration successful
      </Title>
      <p role="status" className="no-margin text-14 lh-130 text-secondary">
        Please check your email to verify your account before logging in.
      </p>
      <div className="text-center">
        <Icon
          name="notification-success"
          className="display-inline-block size-xs text-success"
        />
      </div>
    </Stack>
  );
}
