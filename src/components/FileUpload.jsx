import React, { useCallback } from 'react';
import {
  Box,
  VStack,
  Text,
  Icon,
  useColorModeValue
} from '@chakra-ui/react';
import { useDropzone } from 'react-dropzone';
import { FiUploadCloud } from 'react-icons/fi';

const FileUpload = ({ onFileSelect, selectedFiles }) => {
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
  const hoverBg = useColorModeValue('blue.50', 'blue.900');
  const activeBg = useColorModeValue('blue.100', 'blue.800');

  return (
    <Box
      {...getRootProps()}
      p={10}
      border="2px dashed"
      borderColor={isDragActive ? 'blue.500' : borderColor}
      borderRadius="lg"
      bg={isDragActive ? activeBg : bgColor}
      cursor="pointer"
      transition="all 0.2s"
      _hover={{ bg: hoverBg, borderColor: 'blue.400' }}
      textAlign="center"
    >
      <input {...getInputProps()} />
      <VStack spacing={4}>
        <Icon as={FiUploadCloud} w={16} h={16} color="blue.500" />
        {selectedFiles && selectedFiles.length > 0 ? (
          <>
            <Text fontSize="lg" fontWeight="medium" color="blue.600">
              已选择 {selectedFiles.length} 个文件
            </Text>
            {selectedFiles.map((f, idx) => (
              <Box key={idx}>
                <Text fontSize="md" color="gray.600">
                  {f.name}
                </Text>
                <Text fontSize="sm" color="gray.500">
                  {(f.size / 1024).toFixed(2)} KB
                </Text>
              </Box>
            ))}
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