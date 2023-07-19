
export const makeRoute = ({
  serverUrl = null,
  slug,
  branch = null,
  isQuest = false,
  realm = null, // same as branch when isQuest
  documentName = null,
}) => {
  if (!slug) {
    console.warn(`makeRoute() need a slug!`)
    return null
  }
  let result = serverUrl ?? ''
  if (isQuest) {
    result += `/endlessquest`
  } else if (documentName) {
    result += `/document`
  }
  result += `/${slug}`
  if (isQuest && realm) result += `/${realm}`
  else if (branch) result += `/${branch}`
  if (documentName) result += `/${documentName}`
  return result
}
