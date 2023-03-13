import React, { useState } from 'react'
import { useClientRoom } from '@/hooks/useRoom'
import SlugSelector from '@/components/SlugSelector'
import Snapshot from '@/components/Snapshot'

const SnapshotSlug = () => {
  const [slug, setSlug] = useState(null)
  const { store } = useClientRoom(slug)

  return (
    <div className='FillParent'>
      <SlugSelector selectedValue={slug} onChange={setSlug} />
      <br />
      <Snapshot store={store} />
    </div>
  )
}

export default SnapshotSlug
