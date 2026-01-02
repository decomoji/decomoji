export const getParsedSemVerObject = (semver) => {
  const [major, minor, patch] = String(semver)
    .split(".")
    .map((num) => parseInt(num, 10));
  return { major, minor, patch };
};
