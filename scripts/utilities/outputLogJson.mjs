import { writeJsonFileSync } from "./writeJsonFileSync.mjs";
import { getFormatedDateTime } from "./getFormatedDateTime.mjs";

export const outputLogJson = (data, name, INVOKER) => {
  const filename = `_${INVOKER}_tmp_${name}_${getFormatedDateTime()}.json`;
  writeJsonFileSync(data, `./configs/${filename}`);
};
