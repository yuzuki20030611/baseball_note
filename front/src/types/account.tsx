export type CreateAccountType = {
  email: string
  password1: string
  password2?: string
  account_role: AccountRole
}

export enum AccountRole {
  PLAYER = 0,
  COACH = 1,
}

export type LoginGetAccout = {
  email: string
  password: string
}
