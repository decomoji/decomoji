// v5 -> v6 のエイリアスを貼って運用しているワークスペースか否かを、
// 今回の実行モードと前回の状態（logs/history.json の compatible）から決める
//
// 前回の実行モード（history.inputs.mode）では判定できない
// 互換のある移行をした後に更新を重ねると、記録が update で上書きされて移行時のモードを辿れなくなるため、
// 更新では前回の状態をそのまま引き継いでいく
export const isCompatibleWorkspace = ({ mode, compatible }) => {
  // 互換のある移行をした時点でエイリアスを持つワークスペースになる
  if (mode === "compatible_migration") {
    return true;
  }

  // 更新は状態を変えない
  if (mode === "update") {
    return compatible === true;
  }

  // 移行はエイリアスを貼らず、全削除は消すだけなのでエイリアスを持たない
  return false;
};
