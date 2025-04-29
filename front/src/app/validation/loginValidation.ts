type formDataType = {
    currentPassword: string,
    newPassword: string,
    confirmPassword: string,
}

export type formDataValidationErrors = {
    currentPassword?: string ,
    newPassword?: string,
    confirmPassword?: string,
}


export const validateLoginEdit = (formData: formDataType): formDataValidationErrors => {
    const newErrors: formDataValidationErrors = {}

    if (!formData.currentPassword) {
      newErrors.currentPassword = '現在のパスワードを入力してください'
    }

    if (!formData.newPassword) {
      newErrors.newPassword = '新しいパスワードを入力してください'
    } else if (formData.newPassword.length < 8) {
      newErrors.newPassword = 'パスワードは8文字以上で入力してください'
    }
    if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = 'パスワードが一致しません'
    }

    return newErrors
  }
