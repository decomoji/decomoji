import { writeJsonFile } from "./writeJsonFile.mjs";
import { getFormatedDateTime } from "./getFormatedDateTime.mjs";

export const outputResultJson = async ({ data, name, invoker }) => {
  await writeJsonFile(
    data,
    `./configs/_tmp_${invoker}_${name}_${getFormatedDateTime()}.json`
  );
  Object.keys(data).forEach((key) => {
    console.log(`${key}: ${data[key].length}`);
  });
};
