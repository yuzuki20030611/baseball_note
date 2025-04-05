import { CreateAddMenu } from "../../types/AddMenu"

export type AddMenuValidationErrors = {
    menu?: string,
}

export const validateAddMenu = (data: CreateAddMenu): AddMenuValidationErrors => {
    const errors: AddMenuValidationErrors = {}

    if(!data.menu || data.menu.trim() === "") {
        errors.menu = "メニュー名を入力してください。"
    } else if(data.menu.length < 2) {  // 修正: > から < に変更
        errors.menu = "メニュー名は2文字以上入力してください。"
    } else if(data.menu.length >= 100) {
        errors.menu = "メニュー名は100文字未満にしてください。"
    }

    return errors
}