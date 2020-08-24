// manages にデコモジオブジェクトを push （場合によってはアイテムをマージ）し、オブジェクトを返す
const getMixedArrayOfManages = (diffAsMode, manages) => {
  const _manages = manages;
  Object.entries(diffAsMode).forEach((entry) => {
    const [filterMode, list] = entry;
    if (filterMode === "fixed" || filterMode === "rename") {
      list.forEach((decomoji) => {
        const manage = _manages[filterMode];
        const indexOfManage = manage.findIndex((v) => v.name === decomoji.name);
        // 同じ名前があったらマージして置き換える
        if (indexOfManage > -1) {
          const merged = { ...manage[indexOfManage], ...decomoji };
          manage.splice(indexOfManage, 1, merged);
        } else {
          manage.push(decomoji);
        }
      });
    }
  });
  return _manages;
};

module.exports = getMixedArrayOfManages;
