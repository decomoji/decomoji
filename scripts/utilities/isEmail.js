const emailValidator = require("email-validator");

// 値が Valid な Email 形式であるか否か、否の場合エラーメッセージを返す
const isEmail = (value) => {
  return emailValidator.validate(value) ? true : "Invalid Email format.";
};

module.exports = isEmail;
