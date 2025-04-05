import { CreateAccountType } from "../../types/account";

export type validateCreateErrortypes = {
  email?: string;
  password1?: string;
  password2?: string;
  account_role?: string;
};

export const validateCreateAccount = (
  data: CreateAccountType
): validateCreateErrortypes => {
  const errors: validateCreateErrortypes = {};

  // メールアドレスのバリデーション
  if (!data.email || data.email.trim() === "") {
    errors.email = "メールアドレスは必須です。";
  } else {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(data.email)) {
      errors.email = "有効なメールアドレスを入力してください。";
    }
  }

  // パスワードのバリデーション
  if (!data.password1 || data.password1.trim() === "") {
    errors.password1 = "パスワードは必須です。";
  } else if (data.password1.length >= 500) {
    errors.password1 = "パスワードは500字以内にしてください";
  } else if (data.password1.length < 8) {
    errors.password1 = "パスワードは8文字以上に設定してください";
  }else {
    // パスワード強度のチェック（オプション）
    const hasNumber = /\d/.test(data.password1);
    const hasLetter = /[a-zA-Z]/.test(data.password1);
    
    if (!hasNumber || !hasLetter) {
      errors.password1 = "パスワードは数字とアルファベットを含める必要があります";
}}


  // 確認用パスワードのバリデーション
  if (!data.password2 || data.password2.trim() === "") {
    errors.password2 = "確認用パスワードは必須です。";
  } else if (data.password2 !== data.password1) {
    errors.password2 = "パスワードが一致していません";
  }
  

  if (data.account_role === undefined || data.account_role === null) {
  errors.account_role = "アカウントタイプを入力してください";
}

  return errors;
};
