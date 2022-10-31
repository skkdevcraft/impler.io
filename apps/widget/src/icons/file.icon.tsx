import { IIcon } from '@types';

export function FileIcon(props: IIcon) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="-4 -2 24 24"
      fill="currentColor"
      style={props?.styles}
      className={props?.className}
    >
      {/* eslint-disable-next-line max-len */}
      <path d="M10.298 2H3a1 1 0 0 0-1 1v14a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V4.961L10.298 2zM3 0h8l5 4v13a3 3 0 0 1-3 3H3a3 3 0 0 1-3-3V3a3 3 0 0 1 3-3z"></path>
    </svg>
  );
}
