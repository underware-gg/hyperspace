
export const makeRoute = ({
  url = null,
  slug,
  branch = null,
  documentName = null,
}) => {
  if (!slug) {
    console.warn(`makeRoute() need a slug!`)
    return null
  }
  let result = url ?? ''
  if (documentName) result += `/document`
  result += `/${slug}`
  if (branch) result += `/${branch}`
  if (documentName) result += `/${documentName}`
  return result
}
