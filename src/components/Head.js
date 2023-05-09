import React from 'react'
import NextHead from 'next/head'
import { useSlugs } from '@/hooks/useSlugs'

const Head = () => {
  const { slug, key } = useSlugs()
  const title = `Hyperbox | ${slug ?? 'funDAOmental'}`

  return (
    <NextHead>
      <title>{title}</title>
      <meta charSet='utf-8' />
      <meta name="description" content="Hyperbox, a collaborative, composable metaverse by funDAOmental" />
      <meta name='viewport' content='width=device-width, initial-scale=1.0' />
      <link rel="icon" href="/favicon.ico" />
    </NextHead>
  )
}

export default Head
