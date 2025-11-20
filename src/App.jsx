import React, { useState } from "react";
import {
  ChakraProvider,
  Box,
  Container,
  VStack,
  Heading,
  Button,
  ButtonGroup,
  useToast,
  useColorModeValue,
  Text,
  Divider,
  Progress,
  HStack,
  Icon,
} from "@chakra-ui/react";
import theme from "./theme";
import {
  DownloadIcon,
  LockIcon,
  UnlockIcon,
  CloseIcon,
} from "@chakra-ui/icons";
import FileUpload from "./components/FileUpload";
import KeyInput from "./components/KeyInput";
import { encryptFile, decryptFile } from "./utils/crypto";
import JSZip from "jszip";
import { saveAs } from "file-saver";

const App = () => {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [password, setPassword] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [processedFiles, setProcessedFiles] = useState([]);
  const [mode, setMode] = useState("encrypt");
  const toast = useToast();

  const handleFileSelect = (files) => {
    setSelectedFiles(files);
    setProcessedFiles([]);
  };

  const handleRemoveFile = (index) => {
    setSelectedFiles((prev) => {
      const arr = Array.from(prev || []);
      arr.splice(index, 1);
      return arr;
    });
  };

  const handleEncrypt = async () => {
    if (!selectedFiles || selectedFiles.length === 0) {
      toast({ title: "请至少选择一个文件", status: "warning", duration: 3000 });
      return;
    }
    if (!password) {
      toast({ title: "请输入密钥", status: "warning", duration: 3000 });
      return;
    }

    // 并发限制（默认并发数为 3）
    const concurrency = 3;
    setIsProcessing(true);
    try {
      const results = await runWithConcurrency(
        selectedFiles,
        concurrency,
        async (f) => {
          const blob = await encryptFile(f, password);
          return { originalName: f.name, blob };
        }
      );
      setProcessedFiles(results);
      toast({ title: "批量加密完成", status: "success", duration: 3000 });
    } catch (error) {
      toast({
        title: "加密失败",
        description: error.message,
        status: "error",
        duration: 3000,
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDecrypt = async () => {
    if (!selectedFiles || selectedFiles.length === 0) {
      toast({ title: "请至少选择一个文件", status: "warning", duration: 3000 });
      return;
    }
    if (!password) {
      toast({ title: "请输入密钥", status: "warning", duration: 3000 });
      return;
    }

    const concurrency = 3;
    setIsProcessing(true);
    try {
      const results = await runWithConcurrency(
        selectedFiles,
        concurrency,
        async (f) => {
          const res = await decryptFile(f, password);
          return { originalName: f.name, ...res };
        }
      );
      setProcessedFiles(results);
      toast({ title: "批量解密完成", status: "success", duration: 3000 });
    } catch (error) {
      toast({
        title: "解密失败",
        description: error.message,
        status: "error",
        duration: 3000,
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // 并发执行工具
  async function runWithConcurrency(items, concurrency, worker) {
    const results = [];
    const executing = [];

    for (const item of items) {
      const p = Promise.resolve().then(() => worker(item));
      results.push(p);

      if (concurrency <= items.length) {
        const e = p.then(() => executing.splice(executing.indexOf(e), 1));
        executing.push(e);
        if (executing.length >= concurrency) {
          await Promise.race(executing);
        }
      }
    }

    return Promise.all(results);
  }

  const handleDownloadZip = async () => {
    if (!processedFiles || processedFiles.length === 0) return;
    const zip = new JSZip();

    for (const item of processedFiles) {
      const name = item.originalName || "file";
      let fileName;
      if (mode === "encrypt") {
        const baseName = name.includes(".")
          ? name.substring(0, name.lastIndexOf("."))
          : name;
        fileName = `${baseName}.encrypted`;
        zip.file(fileName, item.blob);
      } else {
        const ext = item.extension ? `.${item.extension}` : "";
        fileName = name.replace(/\.encrypted$/, "") + ext;
        zip.file(fileName, item.blob);
      }
    }

    const content = await zip.generateAsync({ type: "blob" });
    saveAs(content, `processed_files_${Date.now()}.zip`);
  };

  const handleClear = () => {
    if (
      (!selectedFiles || selectedFiles.length === 0) &&
      (!processedFiles || processedFiles.length === 0)
    )
      return;
    setSelectedFiles([]);
    setProcessedFiles([]);
    toast({ title: "文件已清空", status: "info", duration: 2000 });
  };

  const handleDownload = (item) => {
    if (!item) return;

    let downloadBlob;
    let fileName;
    const originalName = item.originalName || "file";

    if (mode === "encrypt") {
      downloadBlob = item.blob;
      const baseName =
        originalName.substring(0, originalName.lastIndexOf(".")) ||
        originalName;
      fileName = `${baseName}.encrypted`;
    } else {
      downloadBlob = item.blob;
      const extension = item.extension;
      let baseName = originalName.replace(/\.encrypted$/, "");
      baseName = baseName.substring(0, baseName.lastIndexOf(".")) || baseName;
      fileName = extension ? `${baseName}.${extension}` : baseName;
    }

    const url = URL.createObjectURL(downloadBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <ChakraProvider theme={theme}>
      <Box minH="100vh" bg="gray.50" py={10}>
        <Container maxW="container.md">
          <VStack spacing={8} align="stretch">
            <Box textAlign="center">
              <Heading size="2xl" color="brand.600" mb={2}>
                <Icon as={LockIcon} mr={3} />
                BinLock-Web
              </Heading>
              <Text color="gray.600" fontSize="lg">
                安全加密您的文件，保护隐私数据
              </Text>
            </Box>

            <Box bg="white" p={8} borderRadius="xl" boxShadow="lg">
              <VStack spacing={6} align="stretch">
                <HStack justify="center" spacing={4}>
                  <Button
                    colorScheme={mode === "encrypt" ? "brand" : "gray"}
                    variant={mode === "encrypt" ? "solid" : "ghost"}
                    onClick={() => setMode("encrypt")}
                    leftIcon={<LockIcon />}
                    size="lg"
                    aria-pressed={mode === "encrypt"}
                  >
                    加密
                  </Button>
                  <Button
                    colorScheme={mode === "decrypt" ? "brand" : "gray"}
                    variant={mode === "decrypt" ? "solid" : "ghost"}
                    onClick={() => setMode("decrypt")}
                    leftIcon={<UnlockIcon />}
                    size="lg"
                    aria-pressed={mode === "decrypt"}
                  >
                    解密
                  </Button>
                </HStack>

                <Divider />

                <FileUpload
                  onFileSelect={handleFileSelect}
                  selectedFiles={selectedFiles}
                  onFileRemove={handleRemoveFile}
                />

                <KeyInput
                  value={password}
                  onChange={setPassword}
                  placeholder={
                    mode === "encrypt" ? "请输入加密密钥" : "请输入解密密钥"
                  }
                />

                {isProcessing && (
                  <Box>
                    <Text mb={2} color="gray.600">
                      正在处理中...
                    </Text>
                    <Progress size="sm" isIndeterminate colorScheme="brand" />
                  </Box>
                )}

                <VStack spacing={3} w="full">
                  <Button
                    w="full"
                    colorScheme="brand"
                    size="lg"
                    onClick={mode === "encrypt" ? handleEncrypt : handleDecrypt}
                    isLoading={isProcessing}
                    isDisabled={
                      !selectedFiles || selectedFiles.length === 0 || !password
                    }
                  >
                    {mode === "encrypt" ? "开始加密" : "开始解密"}
                  </Button>

                  {processedFiles && processedFiles.length > 0 && (
                    <HStack spacing={3} w="full">
                      <Button
                        flex={1}
                        colorScheme="green"
                        size="lg"
                        leftIcon={<DownloadIcon />}
                        onClick={() => handleDownload(processedFiles[0])}
                      >
                        下载第一个
                      </Button>

                      <Button
                        flex={1}
                        colorScheme="brand"
                        size="lg"
                        leftIcon={<DownloadIcon />}
                        onClick={handleDownloadZip}
                      >
                        导出 ZIP
                      </Button>
                    </HStack>
                  )}

                  <Button
                    w="full"
                    colorScheme="red"
                    size="lg"
                    variant="outline"
                    leftIcon={<CloseIcon />}
                    onClick={handleClear}
                    isDisabled={
                      (!selectedFiles || selectedFiles.length === 0) &&
                      (!processedFiles || processedFiles.length === 0)
                    }
                  >
                    清空
                  </Button>
                </VStack>

                {processedFiles && processedFiles.length > 0 && (
                  <Box mt={4}>
                    <Text fontSize="sm" mb={2} color="gray.600">
                      处理结果
                    </Text>
                    <Box
                      maxH="240px"
                      overflowY="auto"
                      borderRadius="md"
                      px={2}
                      py={2}
                      bg={useColorModeValue("gray.50", "gray.900")}
                    >
                      <VStack spacing={2} align="stretch">
                        {processedFiles.map((p, idx) => (
                          <HStack key={idx} justify="space-between">
                            <Text isTruncated maxW="70%">
                              {p.originalName}
                            </Text>
                            <HStack>
                              <Button
                                size="sm"
                                onClick={() => handleDownload(p)}
                                leftIcon={<DownloadIcon />}
                              >
                                下载
                              </Button>
                            </HStack>
                          </HStack>
                        ))}
                      </VStack>
                    </Box>
                  </Box>
                )}
              </VStack>
            </Box>

            <Box bg="brand.50" p={6} borderRadius="lg">
              <Heading size="sm" mb={3} color="brand.700">
                使用说明
              </Heading>
              <VStack align="start" spacing={2} fontSize="sm" color="gray.700">
                <Text>• 加密：上传文件，设置密钥，点击加密并下载</Text>
                <Text>• 解密：上传加密文件，输入正确密钥，点击解密并下载</Text>
                <Text>
                  • 建议使用强密钥（至少8位，包含大小写字母、数字和符号）
                </Text>
                <Text>• 所有操作均在本地完成，文件不会上传到服务器</Text>
              </VStack>
            </Box>
            <Box textAlign="center" mt={4} color="gray.500" fontSize="sm">
              <footer>
                © {new Date().getFullYear()} Evan. All rights reserved.
              </footer>
            </Box>
          </VStack>
        </Container>
      </Box>
    </ChakraProvider>
  );
};

export default App;
