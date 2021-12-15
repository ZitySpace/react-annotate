export const getLocalISOString = () => {
  const tzoffset = new Date().getTimezoneOffset() * 60000
  const localISOString = new Date(Date.now() - tzoffset)
    .toISOString()
    .slice(0, -5)
  return localISOString
}
