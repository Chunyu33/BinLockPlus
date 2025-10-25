import { extendTheme } from '@chakra-ui/react';

const colors = {
  brand: {
    50: '#eaf7e8',
    100: '#d4f0d1',
    200: '#a8e1a3',
    300: '#7ccb76',
    400: '#59b94f',
    500: '#4fac50',
    600: '#3f8f46',
    700: '#2f6f33',
    800: '#1f4f20',
    900: '#102510'
  }
};

const components = {
  Button: {
    baseStyle: {
      borderRadius: 'md'
    },
    variants: {
      solid: (props) => ({
        bg: props.colorMode === 'dark' ? 'brand.400' : 'brand.500',
        color: 'white',
        _hover: { bg: 'brand.600' }
      })
    }
  },
  Heading: {
    baseStyle: {
      color: 'brand.600'
    }
  }
};

const theme = extendTheme({ colors, components });

export default theme;
