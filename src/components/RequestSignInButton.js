import React from 'react'
import { useVeridaContext, VeridaActions } from '@/hooks/VeridaContext'
import { Button } from '@/components/Button'

const RequestSignInButton = ({
  label = 'Sign In',
}) => {
  const { dispatchVerida } = useVeridaContext()

  const _requestSignIn = () => {
    dispatchVerida(VeridaActions.setRequestSignIn, true)
  }

  return (
    <Button onClick={() => _requestSignIn()}>
      {label}
    </Button>
  )
}

export default RequestSignInButton
