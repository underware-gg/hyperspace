import React from 'react'
import ReactMarkdown from 'react-markdown'
import {
  Heading,
  Box,
  Text,
  Link,
  Divider,
  Image,
  ListItem,
  UnorderedList,
  OrderedList,
} from '@chakra-ui/react'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { theme } from 'config/syntax-theme'
import { /* ExternalLinkIcon, */ LinkIcon } from '@chakra-ui/icons'

const components = {
  // Add a check here to see if it's an external or internal link and then optionally render LinkIcon or ExternalLinkIcon
  a: ({ href, children }) => (
    <Link href={href} /* isExternal */>
      {/* {children} <ExternalLinkIcon mx='2px' /> */}
      {children} <LinkIcon mx='2px' />
    </Link>
  ),
  // blockquote: () => {},
  // br: () => <br />,
  // em: () => {},
  h1: ({ children }) => (
    <Heading as='h1' size='2xl'>
      {children}
    </Heading>
  ),
  h2: ({ children }) => (
    <Heading as='h2' size='xl'>
      {children}
    </Heading>
  ),
  h3: ({ children }) => (
    <Heading as='h3' size='lg'>
      {children}
    </Heading>
  ),
  h4: ({ children }) => (
    <Heading as='h4' size='md'>
      {children}
    </Heading>
  ),
  h5: ({ children }) => (
    <Heading as='h5' size='sm'>
      {children}
    </Heading>
  ),
  h6: ({ children }) => (
    <Heading as='h6' size='xs'>
      {children}
    </Heading>
  ),
  hr: () => <Divider orientation='horizontal' />,
  img: ({ src, alt }) => (
    <Image src={src} alt={alt} w='100%' sx={{ imageRendering: 'pixelated' }} />
  ),
  li: ({ children }) => <ListItem>{children}</ListItem>,
  ol: ({ children }) => (
    <Box>
      <OrderedList>{children}</OrderedList>
    </Box>
  ),
  p: ({ children }) => <Text>{children}</Text>,
  // pre: () => {},
  // strong: () => {},
  ul: ({ children }) => (
    <Box>
      <UnorderedList>{children}</UnorderedList>
    </Box>
  ),
  code: ({ node, inline, className, children, ...props }) => {
    const match = /language-(\w+)/.exec(className || '')
    return !inline && match ? (
      <Box
        as={SyntaxHighlighter}
        w='100%'
        language={match[1]}
        style={theme}
        {...props}
      >
        {String(children).replace(/\n$/, '')}
      </Box>
    ) : (
      <code className={className} {...props}>
        {children}
      </code>
    )
  },
}

const Markdown = ({ children = '' }) => {
  return <ReactMarkdown components={components}>{children}</ReactMarkdown>
}

export default Markdown
