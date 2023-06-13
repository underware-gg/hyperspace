import React, { useMemo, useState } from 'react'
import {
  Slider as ChakraSlider,
  SliderMark,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  Box,
  Divider,
  Spacer,
  Text,
  Input,
} from '@chakra-ui/react'
import { clamp, map } from '@/core/utils'

const labelStyles = {
  mt: '2',
  ml: '-2.5',
  fontSize: 'sm',
}


const SliderProgress = ({
  defaultValue = 0,
  value = null,
  precision = 100,
  onChange = (progress) => { },
}) => {
  const [sliderValue, setSliderValue] = useState(0)

  const _onChange = (value) => {
    setSliderValue(value)
    onChange(value / precision)
  }

  const p = precision / 100

  return (
    <Box p={'0 1.3em'}>
      <Box pt={8} />
      <ChakraSlider
        defaultValue={defaultValue * precision}
        value={value != null ? (value * precision) : undefined}
        min={0} max={precision} step={1}
        aria-label='slider-ex-6'
        onChange={(value) => _onChange(value)}
      >
        <SliderMark value={0} {...labelStyles}>
          0%
        </SliderMark>
        <SliderMark value={25 * p} {...labelStyles}>
          25%
        </SliderMark>
        <SliderMark value={50 * p} {...labelStyles}>
          50%
        </SliderMark>
        <SliderMark value={75 * p} {...labelStyles}>
          75%
        </SliderMark>
        <SliderMark value={100 * p} {...labelStyles}>
          100%
        </SliderMark>
        <SliderMark
          value={sliderValue}
          textAlign='center'
          bg='teal.500'
          color='white'
          mt='-10'
          ml='-5'
          w='12'
        >
          {Math.floor(sliderValue / p)}%
        </SliderMark>
        <SliderTrack bg='#fff2'>
          <SliderFilledTrack bg='teal' />
        </SliderTrack>
        <SliderThumb />
      </ChakraSlider>
    </Box>
  )
}

const SliderPage = ({
  pageCount = 1,
  defaultPage = null,
  defaultValue = null,
  precision = 100,
  disabled = false,
  onChange = () => { },
}) => {
  const [sliderValue, setSliderValue] = useState(1)

  const _firstPage = 1
  const _lastPage = Math.max(pageCount, 1)

  const _progressToPage = (progress) => {
    return map(progress, 0, 1, _firstPage, _lastPage)
  }
  const _pageToProgress = (value) => {
    return map(value, _firstPage, _lastPage, 0.0, 1.0)
  }

  const _defaultValue = clamp(defaultPage != null ? defaultPage : defaultValue != null ? _progressToPage(defaultValue) : _firstPage, _firstPage, _lastPage)

  const _onChange = (page) => {
    setSliderValue(page)
    onChange(_pageToProgress(page), page)
  }

  const markers = useMemo(() => {
    let result = []
    for (let p = _firstPage; p <= _lastPage; ++p) {
      result.push(
        <SliderMark key={`page${p}`} value={p} {...labelStyles}>
          {p}
        </SliderMark>
      )
    }
    return result
  }, [pageCount])

  const _disabled = disabled || (_firstPage == _lastPage)

  return (
    <Box p={'0 1.3em'}>
      <Box pt={8} />
      <ChakraSlider
        defaultValue={_defaultValue}
        min={_firstPage} max={_lastPage} step={1}
        disabled={_disabled}
        aria-label='slider-ex-6'
        onChange={(value) => _onChange(value)}
      >
        {markers}
        {!_disabled &&
          <SliderMark
            value={sliderValue}
            textAlign='center'
            bg='teal.500'
            color='white'
            mt='-10'
            ml='-5'
            w='12'
          >
            Pg.{sliderValue}
          </SliderMark>
        }
        <SliderTrack bg='#fff2'>
          <SliderFilledTrack bg='teal' />
        </SliderTrack>
        <SliderThumb />
      </ChakraSlider>
    </Box>
  )
}

export {
  SliderProgress,
  SliderPage,
}
