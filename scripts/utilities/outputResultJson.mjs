import { writeJsonFile } from "./writeJsonFile.mjs";
import { getFormatedDateTime } from "./getFormatedDateTime.mjs";

export const outputResultJson = (data, name, INVOKER) => {
  writeJsonFile(
    data,
    `./configs/_${INVOKER}_tmp_${name}_${getFormatedDateTime()}.json`
  );
  Object.keys(data).forEach((key) => {
    console.log(`${key}: ${data[key].length}`);
  });
};
