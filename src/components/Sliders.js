import React, { useState } from 'react'
import {
  Slider as ChakeaSlider,
  SliderMark,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  Box,
  Spacer,
  Text,
  Input,
} from '@chakra-ui/react'

const SliderProgress = ({
  firstPage = 1,
  lastPage = 2,
  onChange = () => { },
}) => {
  const [sliderValue, setSliderValue] = useState(0)

  const labelStyles = {
    mt: '2',
    ml: '-2.5',
    fontSize: 'sm',
  }

  const _onChange = (value) => {
    setSliderValue(value)
    onChange(value / 100)
  }

  return (
    <Box pt={6} pb={2}>
      <ChakeaSlider aria-label='slider-ex-6' onChange={(value) => _onChange(value)}>
        <SliderMark value={25} {...labelStyles}>
          25%
        </SliderMark>
        <SliderMark value={50} {...labelStyles}>
          50%
        </SliderMark>
        <SliderMark value={75} {...labelStyles}>
          75%
        </SliderMark>
        <SliderMark
          value={sliderValue}
          textAlign='center'
          bg='blue.500'
          color='white'
          mt='-10'
          ml='-5'
          w='12'
        >
          {sliderValue}%
        </SliderMark>
        <SliderTrack>
          <SliderFilledTrack />
        </SliderTrack>
        <SliderThumb />
      </ChakeaSlider>
    </Box>
  )
}

export { SliderProgress }
