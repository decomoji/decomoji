// バージョンを v つきにして返す
const convertToVPrefixedVersion = (version) => {
  return /^v[0-9]/.test(version) ? version : `v${version}`;
};

module.exports = convertToVPrefixedVersion;
