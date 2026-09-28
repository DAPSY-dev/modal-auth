import { useAppDispatch } from '../../../app/store';
import { showModal } from '../authSlice';
import { Stack } from '../../../components/Stack';
import { Title } from '../../../components/Title';
import { Link } from '../../../components/Link';
import { Icon } from '../../../components/Icon';

export function ResetPasswordSuccess() {
  const dispatch = useAppDispatch();
  return (
    <Stack size="l">
      <Title id="auth-title" tabIndex={-1} className="text-center">
        Password updated
      </Title>
      <p
        role="status"
        className="no-margin text-14 lh-130 text-secondary text-center"
      >
        Log in with your new password to continue.
      </p>
      <div className="text-center">
        <Icon
          name="notification-success"
          className="display-inline-block size-xs text-success"
        />
      </div>
      <Link
        as="button"
        variant="secondary"
        onClick={() => dispatch(showModal('login'))}
      >
        Back to login
      </Link>
    </Stack>
  );
}
