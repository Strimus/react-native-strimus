import { Path, Svg } from 'react-native-svg';

const PlayIcon = () => {
  return (
    <Svg
      width="34"
      height="34"
      viewBox="0 0 24 24"
      stroke-width="1.5"
      stroke="#2c3e50"
      fill="none"
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      <Path stroke="none" d="M0 0h24v24H0z" fill="none" />
      <Path d="M7 4v16l13 -8z" />
    </Svg>
  );
};

export default PlayIcon;
