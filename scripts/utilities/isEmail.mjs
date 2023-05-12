import emailValidator from "email-validator";

// 値が Valid な Email 形式であるか否か、否の場合エラーメッセージを返す
export const isEmail = (value) =>
  emailValidator.validate(value) ? true : "Invalid Email format.";
