import { writeJsonFile } from "./writeJsonFile.mjs";
import { getFormatedDateTime } from "./getFormatedDateTime.mjs";

export const outputLogJson = async ({ data, invoker, name }) =>
  await writeJsonFile(
    data,
    `logs/_tmp_${invoker}_${name}_${getFormatedDateTime()}.json`
  );
