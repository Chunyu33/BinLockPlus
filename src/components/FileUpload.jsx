import React, { useCallback } from 'react';
import {
  Box,
  VStack,
  Text,
  Icon,
  useColorModeValue,
  HStack,
  CloseButton
} from '@chakra-ui/react';
import { useDropzone } from 'react-dropzone';
import { FiUploadCloud } from 'react-icons/fi';

const FileUpload = ({ onFileSelect, selectedFiles, onFileRemove }) => {
  const onDrop = useCallback((acceptedFiles) => {
    if (acceptedFiles.length > 0) {
      onFileSelect(acceptedFiles);
    }
  }, [onFileSelect]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: true,
    maxSize: 100 * 1024 * 1024
  });

  const bgColor = useColorModeValue('gray.50', 'gray.700');
  const borderColor = useColorModeValue('gray.300', 'gray.600');
  const hoverBg = useColorModeValue('brand.50', 'brand.800');
  const activeBg = useColorModeValue('brand.100', 'brand.700');
  const itemBg = useColorModeValue('gray.50', 'gray.800');

  return (
    <Box
      {...getRootProps()}
      p={6}
      border="2px dashed"
      borderColor={isDragActive ? 'brand.500' : borderColor}
      borderRadius="lg"
      bg={isDragActive ? activeBg : bgColor}
      cursor="pointer"
      transition="all 0.2s"
      _hover={{ bg: hoverBg, borderColor: 'brand.400' }}
      textAlign="center"
    >
      <input {...getInputProps()} />
      <VStack spacing={3} align="stretch">
        <Box textAlign="center">
          <Icon as={FiUploadCloud} w={14} h={14} color="brand.500" />
        </Box>
        {selectedFiles && selectedFiles.length > 0 ? (
          <>
            <Text fontSize="lg" fontWeight="medium" color="brand.600">
              已选择 {selectedFiles.length} 个文件
            </Text>
            <Box maxH="200px" overflowY="auto" px={1}>
              <VStack spacing={2} align="stretch">
                {selectedFiles.map((f, idx) => (
                  <HStack key={idx} px={2} py={2} borderRadius="md" bg={itemBg} w="full" spacing={3}>
                    <Box flex={1} minW={0}>
                      <Text fontSize="sm" color="gray.700" isTruncated>
                        {f.name}
                      </Text>
                      <Text fontSize="xs" color="gray.500">
                        {(f.size / 1024).toFixed(2)} KB
                      </Text>
                    </Box>
                    <CloseButton size="sm" onClick={(e) => { e.stopPropagation(); if (onFileRemove) onFileRemove(idx); }} />
                  </HStack>
                ))}
              </VStack>
            </Box>
          </>
        ) : (
          <>
            <Text fontSize="lg" fontWeight="medium">
              {isDragActive ? '释放文件到此处' : '拖放文件到此处，或点击选择'}
            </Text>
            <Text fontSize="sm" color="gray.500">
              支持任意文件格式，最大 100MB
            </Text>
          </>
        )}
      </VStack>
    </Box>
  );
};

export default FileUpload;