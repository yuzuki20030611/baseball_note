export const customFormData = <Body extends Record<string, any>>(body: Body): FormData => {
  const formData = new FormData()

  Object.entries(body).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      value.forEach((item) => {
        formData.append(key, item)
      })
    } else {
      formData.append(key, value)
    }
  })

  return formData
}
