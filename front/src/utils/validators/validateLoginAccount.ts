import { LoginGetAccout } from "../../types/account";


export type validateLoginErrortypes = {
  email?: string;
  password?: string;
  account_role?: string;
};

export const validateLoginAccount = (
  data: LoginGetAccout
): validateLoginErrortypes => {
  const errors: validateLoginErrortypes = {};
  if (!data.email || data.email.trim() === "") {
    errors.email = "メールアドレスは必須です。";
  } else {
    // メールアドレスの形式チェック
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(data.email)) {
      errors.email = "有効なメールアドレスを入力してください。";
    }
  }

  if (!data.password || data.password.trim() === "") {
    errors.password = "パスワードは必須です。";
  } else if (data.password.length >= 500) {
    errors.password = "パスワードは500字以内にしてください";
  } else if (data.password.length < 8) {
    errors.password = "パスワードは8文字以上に設定してください";
  }

  return errors;
};
