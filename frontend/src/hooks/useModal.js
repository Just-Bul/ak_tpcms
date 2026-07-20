import { useCallback, useState } from 'react'

/** Open/close + payload state for a modal, e.g. `const editModal = useModal()`. */
export function useModal(initialOpen = false) {
  const [isOpen, setIsOpen] = useState(initialOpen)
  const [payload, setPayload] = useState(null)

  const open = useCallback((data = null) => {
    setPayload(data)
    setIsOpen(true)
  }, [])

  const close = useCallback(() => {
    setIsOpen(false)
    setPayload(null)
  }, [])

  return { isOpen, payload, open, close }
}

export default useModal
