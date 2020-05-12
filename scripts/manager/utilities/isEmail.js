const emailValidator = require("email-validator");
const MESSAGE = require("../configs/MESSAGES");

// 値が Valid な Email 形式であるか否か、否の場合エラーメッセージを返す
const isEmail = (value) => {
  return emailValidator.validate(value) ? true : MESSAGE.INVALID_EMAIL;
};

module.exports = isEmail;
