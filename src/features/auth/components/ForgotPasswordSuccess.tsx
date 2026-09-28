import { Icon } from '../../../components/Icon';
import { Stack } from '../../../components/Stack';
import { Title } from '../../../components/Title';

export function ForgotPasswordSuccess() {
  return (
    <Stack size="l">
      <Title id="auth-title" tabIndex={-1} className="text-center">
        Password recovery
      </Title>
      <p role="status" className="no-margin text-14 lh-130 text-secondary">
        We have sent you a recovery link via e-mail. Not seeing the e-mail?
        Please check your spam, or wait a few minutes.
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
