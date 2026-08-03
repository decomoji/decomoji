import { writeJsonFile } from "./writeJsonFile.mjs";

export const outputLogJson = async ({ data, invoker, name }) =>
  await writeJsonFile(data, `logs/_tmp_${invoker}_${name}_${new Data().toISOstring()}.json`);
