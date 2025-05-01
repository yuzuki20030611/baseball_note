export type LoginInfoFormData = {
    currentPassword: string,
    newPassword: string,
    confirmPassword: string,
    newEmail: string,
    confirmEmail: string,
}

export type LoginInfoValidationErrors = {
    currentPassword?: string ,
    newPassword?: string,
    confirmPassword?: string,
    newEmail?: string,
    confirmEmail?: string,
}


export const validateLoginEdit = (formData: LoginInfoFormData): LoginInfoValidationErrors => {
    const newErrors: LoginInfoValidationErrors = {}

    // パスワード関連フィールドが入力されている場合のバリデーション
    if (formData.newPassword || formData.confirmPassword) {
        if (!formData.currentPassword) {
            newErrors.currentPassword = '現在のパスワードを入力してください'
        }
        
        if (formData.newPassword) {
          if (formData.newPassword.length < 8) {
            newErrors.newPassword = 'パスワードは8文字以上で入力してください'
          }
          
          if (formData.newPassword !== formData.confirmPassword) {
            newErrors.confirmPassword = 'パスワードが一致しません'
          }
        }
      }
      
      // メールアドレス関連フィールドが入力されている場合のバリデーション
      if (formData.newEmail || formData.confirmEmail) {
        if (!formData.currentPassword) {
          newErrors.currentPassword = '現在のパスワードを入力してください'
        }
        
        if (formData.newEmail) {
          if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.newEmail)) {
            newErrors.newEmail = '有効なメールアドレスを入力してください'
          }
          
          if (formData.newEmail !== formData.confirmEmail) {
            newErrors.confirmEmail = 'メールアドレスが一致しません'
          }
        }
      }
    return newErrors
  }

  