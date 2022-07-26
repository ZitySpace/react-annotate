import { MAX_FONT_SIZE } from '../config';

export const getFontSize = (width: number, height: number) => {
  return Math.min(MAX_FONT_SIZE, width / 2, height / 2);
};

export const getLocalTimeISOString = () => {
  const tzoffset = new Date().getTimezoneOffset() * 60000;
  const localISOString = new Date(Date.now() - tzoffset)
    .toISOString()
    .slice(0, -5);
  return localISOString;
};
