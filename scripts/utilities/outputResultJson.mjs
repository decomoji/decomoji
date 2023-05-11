import { writeJsonFileSync } from "./writeJsonFileSync.mjs";
import { getFormatedDateTime } from "./getFormatedDateTime.mjs";

export const outputResultJson = (data, name, INVOKER) => {
  writeJsonFileSync(
    data,
    `./configs/_${INVOKER}_tmp_${name}_${getFormatedDateTime()}.json`
  );
  Object.keys(data).forEach((key) => {
    console.log(`${key}: ${data[key].length}`);
  });
};
