// import {
//   AlertDialog,
//   AlertDialogBody,
//   AlertDialogFooter,
//   AlertDialogHeader,
//   AlertDialogContent,
//   AlertDialogOverlay,
// } from '@chakra-ui/react'

// const ConfirmModal = ({
//   finalRef,
//   isOpen,
//   text,
//   onClose,
//   onConfirm,
// }) => {
//   const { isOpen, onOpen, onClose } = useDisclosure()
//   const cancelRef = React.useRef()

//   return (
//     <AlertDialog
//       isOpen={isOpen}
//       leastDestructiveRef={cancelRef}
//       onClose={onClose}
//       isCentered
//     >
//       <AlertDialogOverlay>
//         <AlertDialogContent>
//           <AlertDialogHeader fontSize='lg' fontWeight='bold'>
//             Delete Customer
//           </AlertDialogHeader>

//           <AlertDialogBody>
//             Are you sure? You can't undo this action afterwards.
//           </AlertDialogBody>

//           <AlertDialogFooter>
//             <Button ref={cancelRef} onClick={onClose}>
//               Cancel
//             </Button>
//             <Button colorScheme='red' onClick={onClose} ml={3}>
//               Delete
//             </Button>
//           </AlertDialogFooter>
//         </AlertDialogContent>
//       </AlertDialogOverlay>
//     </AlertDialog>
//   )
// }

// export default ConfirmModal
