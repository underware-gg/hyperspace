
export const makeRoute = ({
  url = null,
  slug,
  key = null,
  documentName = null,
}) => {
  if (!slug) {
    console.warn(`makeRoute() need a slug!`)
    return null
  }
  let result = url ?? ''
  if (documentName) result += `/document`
  result += `/${slug}`
  if (key) result += `/${key}`
  if (documentName) result += `/${documentName}`
  return result
}
