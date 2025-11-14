import { createRoot } from 'react-dom/client';
import Popup from './Popup';

const renderRoot = createRoot(document.querySelector('#root'));

renderRoot.render(
    <Popup/>
);