import { writeJsonFileSync } from "./writeJsonFileSync";
import { getFormatedDateTime } from "./getFormatedDateTime";

export const outputLogJson = (data, name, INVOKER) => {
  const filename = `_${INVOKER}_tmp_${name}_${getFormatedDateTime()}.json`;
  writeJsonFileSync(data, `./configs/${filename}`);
};
