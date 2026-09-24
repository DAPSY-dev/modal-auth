import { Link } from 'react-router';
import { Icon } from '../components/Icon';

export function UiIconsPage() {
  return (
    <>
      <header>
        <Link to="/ui">Back to UI showcase</Link>
      </header>
      <main>
        <h1>Icons</h1>
        <ul>
          <li>
            <Icon name="close" /> Close
          </li>
          <li>
            <Icon name="close-eye" /> Closed eye
          </li>
        </ul>
      </main>
    </>
  );
}
