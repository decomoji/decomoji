// バージョンを v つきにして返す
export const convertToVPrefixedVersion = (version) => {
  return /^v[0-9]/.test(version) ? version : `v${version}`;
};
