export function isAllowedOrigin(origin) {
  if (!origin) return true;
  return (
    /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin) ||
    /^https?:\/\/(192\.168\.\d{1,3}\.\d{1,3}|10\.\d{1,3}\.\d{1,3}|172\.(1[6-9]|2\d|3[0-1])\.\d{1,3}\.\d{1,3})(:\d+)?$/.test(
      origin
    )
  );
}

export const corsOptions = {
  origin: (origin, cb) => cb(null, isAllowedOrigin(origin)),
};
