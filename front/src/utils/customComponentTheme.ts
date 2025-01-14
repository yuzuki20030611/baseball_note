export const ChipSelectFieldTheme = {
  baseStyle: {
    tag: {
      borderRadius: 'full',
      colorScheme: 'blue',
    },
    menuItemSelected: {
      backgroundColor: 'blue.500',
      color: 'white',
    },
    menuItemUnselected: {
      backgroundColor: 'transparent',
      color: 'black.500',
    },
  },
}

export const PaginationButtonTheme = {
  baseStyle: {
    fontWeight: 'bold',
    fontSize: '24px',
    height: '50px',
    width: '50px',
    bg: 'transparent',
    color: 'black',
    _hover: {
      bg: 'gray.100',
    },
    _disabled: {
      bg: 'transparent',
      color: 'gray.500',
    },
  },
}
