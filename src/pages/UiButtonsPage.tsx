import { Link } from 'react-router';
import { Button } from '../components/Button';
import { Icon } from '../components/Icon';

export function UiButtonsPage() {
  return (
    <>
      <header>
        <Link to="/ui">Back to UI showcase</Link>
      </header>
      <main>
        <h1>Buttons</h1>
        <Button>Example button</Button>
        <Button disabled>Disabled button</Button>
        <Button>
          <Icon name="close" /> Button with icon
        </Button>
      </main>
    </>
  );
}
