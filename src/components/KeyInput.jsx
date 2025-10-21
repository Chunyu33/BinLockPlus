import React, { useState, useEffect } from 'react';
import {
  Box,
  Input,
  InputGroup,
  InputRightElement,
  IconButton,
  FormControl,
  FormLabel,
  FormHelperText,
  Progress,
  Text,
  VStack
} from '@chakra-ui/react';
import { ViewIcon, ViewOffIcon } from '@chakra-ui/icons';
import { checkPasswordStrength } from '../utils/crypto';

const KeyInput = ({ value, onChange, placeholder = '请输入密钥' }) => {
  const [showKey, setShowKey] = useState(false);
  const [strength, setStrength] = useState({ strength: 'weak', score: 0 });

  useEffect(() => {
    setStrength(checkPasswordStrength(value));
  }, [value]);

  const getStrengthColor = () => {
    switch (strength.strength) {
      case 'strong':
        return 'green';
      case 'medium':
        return 'yellow';
      default:
        return 'red';
    }
  };

  const getStrengthText = () => {
    switch (strength.strength) {
      case 'strong':
        return '强';
      case 'medium':
        return '中等';
      default:
        return '弱';
    }
  };

  return (
    <VStack spacing={3} align="stretch">
      <FormControl>
        <FormLabel>密钥</FormLabel>
        <InputGroup size="lg">
          <Input
            type={showKey ? 'text' : 'password'}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            bg="white"
            borderColor="gray.300"
            _hover={{ borderColor: 'blue.400' }}
            _focus={{ borderColor: 'blue.500', boxShadow: '0 0 0 1px #3182ce' }}
          />
          <InputRightElement>
            <IconButton
              size="sm"
              icon={showKey ? <ViewOffIcon /> : <ViewIcon />}
              onClick={() => setShowKey(!showKey)}
              variant="ghost"
              aria-label={showKey ? '隐藏密钥' : '显示密钥'}
            />
          </InputRightElement>
        </InputGroup>
        {value && (
          <Box mt={2}>
            <Progress
              value={strength.score}
              size="sm"
              colorScheme={getStrengthColor()}
              borderRadius="full"
            />
            <Text fontSize="sm" color={`${getStrengthColor()}.500`} mt={1}>
              密钥强度：{getStrengthText()}
            </Text>
          </Box>
        )}
        <FormHelperText>
          建议使用至少8位字符，包含大小写字母、数字和特殊符号
        </FormHelperText>
      </FormControl>
    </VStack>
  );
};

export default KeyInput;