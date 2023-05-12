import { writeJsonFile } from "./writeJsonFile.mjs";
import { getFormatedDateTime } from "./getFormatedDateTime.mjs";

export const outputLogJson = (data, name, INVOKER) => {
  const filename = `_${INVOKER}_tmp_${name}_${getFormatedDateTime()}.json`;
  writeJsonFile(data, `./configs/${filename}`);
};
