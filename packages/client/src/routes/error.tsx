import { useRouteError } from 'react-router-dom';

const imagesWithText = [
  { path: '/assets/images/404_lec.jpg', text: 'Rädd för Corona?' },
  {
    path: '/assets/images/404_logan1.jpg',
    text: 'Lika bra på Frisbee som Logan?',
  },
  { path: '/assets/images/404_logan2.jpg', text: 'Smartast på data?' },
  { path: '/assets/images/404_riddle.jpg', text: 'Känner in rummet?' },
  { path: '/assets/images/404_vilse.jpg', text: 'Ute på äventyr?' },
  { path: '/assets/images/404_win.jpg', text: 'Alltid redo?' },
  { path: '/assets/images/404_boris.jpg', text: 'Kidnappad?' },
  { path: '/assets/images/404_vela.jpg', text: 'Glad i glaset?' },
];

export const NotFound = () => {
  const error = useRouteError() as any;
  const motd =
    imagesWithText[Math.floor(Math.random() * imagesWithText.length)];

  return (
    <div className="not-found">
      <img src={motd.path} />
      <h1> {error.statusText || error.message} </h1>
      <p>{motd.text}</p>
      <small>Sidan kunde alltså inte hittas...</small>
    </div>
  );
};
