import { writeJsonFile } from "./writeJsonFile.mjs";
import { getFormatedDateTime } from "./getFormatedDateTime.mjs";

export const outputLogJson = async ({ data, name, invoker }) =>
  writeJsonFile(
    data,
    `./configs/_tmp_${invoker}_${name}_${getFormatedDateTime()}.json`
  );
