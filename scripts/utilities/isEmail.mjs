const EMAIL_PATTERN =
  /^[-!#$%&'*+/0-9=?A-Z^_a-z{|}~](\.?[-!#$%&'*+/0-9=?A-Z^_a-z`{|}~])*@[a-zA-Z0-9](-*\.?[a-zA-Z0-9])*\.[a-zA-Z](-?[a-zA-Z0-9])+$/;

const isValidEmail = (value) => {
  if (typeof value !== "string" || value.length === 0 || value.length > 254) return false;
  if (!EMAIL_PATTERN.test(value)) return false;
  const [local, domain] = value.split("@");
  return local.length <= 64 && domain.split(".").every((part) => part.length <= 63);
};

// 値が Valid な Email 形式であるか否か、否の場合エラーメッセージを返す
export const isEmail = (value) => (isValidEmail(value) ? true : "Invalid Email format.");
