import { useRouter } from 'next/router'
import { useMemo } from 'react'

const useSlugs = () => {
  const router = useRouter()
  const { route } = router
  const { slugs } = router.query
  const isDocument = route?.startsWith('/document/') ?? false

  const [slug, key, documentName] = useMemo(() => {
    if (isDocument && slugs?.length == 2) {
      // catch: /document/slug/documentName
      return [slugs[0], undefined, slugs[1]]
    }
    // catch: /slug
    // catch: /slug/key
    // catch: /document/slug/key/documentName
    return slugs ?? []
  }, [slugs, isDocument])

  return {
    slug,
    key,
    documentName,
  }
}

export { useSlugs }
