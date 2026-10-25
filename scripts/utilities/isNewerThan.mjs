import { getParsedSemVerObject } from "./getParsedSemVerObject.mjs";
import { isStringOfNotEmpty } from "./isStringOfNotEmpty.mjs";

// semver 同士を比較して、semver が base より新しいなら true
// どちらかが空文字（updated が無いなど）の時は比較できないので false
// v5 は "v5.35.0"、v6 は "6.0.0" と接頭辞の有無が違うので、揃えてから比べる
export const isNewerThan = (semver, base) => {
  if (!isStringOfNotEmpty(semver) || !isStringOfNotEmpty(base)) {
    return false;
  }
  const target = getParsedSemVerObject(String(semver).replace(/^v/, ""));
  const criterion = getParsedSemVerObject(String(base).replace(/^v/, ""));
  return target.major !== criterion.major
    ? target.major > criterion.major
    : target.minor !== criterion.minor
      ? target.minor > criterion.minor
      : target.patch > criterion.patch;
};
