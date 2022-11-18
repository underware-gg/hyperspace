import { Parser } from 'commonmark'

const reader = new Parser()

export const parseMarkdown = (markdown) => {
  const parsed = reader.parse(markdown)

  return parsed
}

export const measureTextHeight = (text, context) => {
  const metrics = context.measureText(text)
  // const fontHeight = metrics.fontBoundingBoxAscent + metrics.fontBoundingBoxDescent
  return metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent
  // return fontHeight
}

// 27, 32, 43
// 237, 238, 238
export const renderMarkdown = (markdown, canvas, context) => {
  const parsed = parseMarkdown(markdown)

  // context.fillStyle = 'rgb(27, 32, 43)'
  context.fillStyle = 'white'
  context.fillRect(0, 0, canvas.width, canvas.height)
  context.fillStyle = 'black'
  // context.fillStyle = 'rgb(237, 238, 238)'

  const headingSizes = [
    48,
    42,
    36,
    30,
    24,
    18,
  ]

  const paragraphSize = 16

  const lineSpacing = 12

  const walker = parsed.walker()
  let event
  let node

  let x = 24
  let y = 24

  let inHeading = false
  let inParagraph = false

  const lines = []
  let currentLine = null

  while ((event = walker.next())) {
    node = event.node
    if (node.type === 'heading') {
      if (event.entering) {
        inHeading = true
        currentLine = {
          type: 'heading',
          level: node.level,
          value: '',
        }
      } else {
        inHeading = false
        lines.push(currentLine)
        currentLine = null
      }
    } else if (node.type === 'paragraph') {
      if (event.entering) {
        inParagraph = true
        currentLine = {
          type: 'paragraph',
          value: '',
        }
      } else {
        inParagraph = false
        lines.push(currentLine)
        currentLine = null
      }
    } else if (node.type === 'text') {
      currentLine.value += node.literal
    }
  }

  lines.forEach((line, i) => {
    if (line.type === 'heading') {
      context.font = `${headingSizes[line.level - 1]}px serif`
    } else if (line.type === 'paragraph') {
      context.font = `${paragraphSize}px serif`
    }

    const textLines = getLines(line.value, context, canvas)

    textLines.forEach(textLine => {
      const textHeight = measureTextHeight(textLine, context)
      y += textHeight * 0.75
      context.fillText(textLine, x, y)
      y += textHeight * 0.5

      if (i !== lines.length - 1) {
        y += + lineSpacing
      }
    })
  })
}

const getLines = (text, context, canvas) => {
  const words = text.split(' ')
  const lines = []
  const currentLine = words[0]

  for (let i = 1; i < words.length; i++) {
    const word = words[i]
    const width = context.measureText(currentLine + ' ' + word).width
    if (width < canvas.width - 48) {
      currentLine += ' ' + word
    } else {
      lines.push(currentLine)
      currentLine = word
    }
  }
  lines.push(currentLine)
  return lines
}
