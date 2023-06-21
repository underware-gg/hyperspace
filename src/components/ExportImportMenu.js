import React, { useState } from 'react'
import { HStack } from '@chakra-ui/react'
import usePermission from '@/hooks/usePermission'
import ModalExporter from '@/components/ModalExporter'
import ModalImporter from '@/components/ModalImporter'
import { Button } from '@/components/Button'

const ExportImportMenu = () => {
  const [showExporter, setShowExporter] = useState(false)
  const [showImporter, setShowImporter] = useState(false)

  const { canEdit } = usePermission('world')

  return (
    <HStack>
      <Button
        disabled={!canEdit}
        // variant='outline'
        size='sm'
        onClick={() => setShowExporter(true)}
      >
        Export Data
      </Button>
      <Button
        disabled={!canEdit}
        // variant='outline'
        size='sm'
        onClick={() => setShowImporter(true)}
      >
        Import Data
      </Button>

      <ModalExporter
        isOpen={showExporter}
        handleClose={() => setShowExporter(false)}
      />
      <ModalImporter
        isOpen={showImporter}
        handleClose={() => setShowImporter(false)}
      />
    </HStack>
  )
}

export default ExportImportMenu
