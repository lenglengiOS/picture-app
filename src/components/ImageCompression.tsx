import React, { useRef, useEffect, useState } from "react";
import { useAtom } from "jotai";
import {
  compressionImageListAtom,
  CompressionImageType,
  showDetailAtom,
} from "@src/store/home";
import { Flex, Table, Button, Tag, Radio } from "antd";
import {
  BlockOutlined,
  MergeCellsOutlined,
  BorderInnerOutlined,
  FileImageFilled,
  RightOutlined,
  SettingOutlined,
  SettingFilled,
  PlaySquareFilled,
  ProductFilled,
  FileAddOutlined,
  DeleteTwoTone,
  DeleteOutlined,
  CompressOutlined,
} from "@ant-design/icons";
import { InboxOutlined } from "@ant-design/icons";
import type { UploadProps, TableColumnsType } from "antd";
import { message, Upload } from "antd";
import "./ImageCompression.css";
import { TableRowSelection } from "antd/es/table/interface";
const { Dragger } = Upload;

const ImageCompression = () => {
  const [compressionImageList, setCompressionImageList] = useAtom(
    compressionImageListAtom
  );

  useEffect(() => {}, []);

  // 未选择图片时，展示选择图片组件
  if (compressionImageList.length === 0) {
    return <SelectImageView />;
  }

  // 已选择图片，展示图片列表和处理页面
  return <CompressionImageListView />;
};

const CompressionImageListView = () => {
  const [compressionImageList, setCompressionImageList] = useAtom(
    compressionImageListAtom
  );
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // 初始化压缩状态
  useEffect(() => {
    setCompressionImageList((prev) =>
      prev.map((item) => ({
        ...item,
        compressionStatus: item.compressionStatus || "pending",
      }))
    );

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  // 格式化文件大小
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  // 格式化图片尺寸
  const formatImageSize = (width?: number, height?: number): string => {
    if (!width || !height) return "-";
    return `${width} × ${height}`;
  };

  // 压缩图片
  const handleCompress = async (record: CompressionImageType) => {
    try {
      // 更新状态为压缩中
      setCompressionImageList((prev) =>
        prev.map((item) =>
          item.uid === record.uid
            ? { ...item, compressionStatus: "compressing" as const }
            : item
        )
      );

      // 使用 Canvas API 进行图片压缩
      const compressedData = await compressImageWithCanvas(
        record.originFileObj,
        0.8, // 质量参数，可以根据需要调整
        1920 // 最大宽度，可以根据需要调整
      );

      // 更新压缩后的信息
      setCompressionImageList((prev) =>
        prev.map((item) =>
          item.uid === record.uid
            ? {
                ...item,
                compressedSize: compressedData.size,
                compressedWidth: compressedData.width,
                compressedHeight: compressedData.height,
                compressionStatus: "compressed" as const,
              }
            : item
        )
      );

      message.success(`${record.name} 压缩完成`);
    } catch (error) {
      console.error("压缩失败:", error);
      message.error(`${record.name} 压缩失败`);
      // 恢复状态
      setCompressionImageList((prev) =>
        prev.map((item) =>
          item.uid === record.uid
            ? { ...item, compressionStatus: "pending" as const }
            : item
        )
      );
    }
  };

  // 使用 Canvas 压缩图片
  const compressImageWithCanvas = (
    file: File,
    quality: number = 0.8,
    maxWidth: number = 1920
  ): Promise<{ size: number; width: number; height: number; blob: Blob }> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          let width = img.width;
          let height = img.height;

          // 如果宽度超过最大宽度，按比例缩放
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }

          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext("2d");
          if (!ctx) {
            reject(new Error("无法创建 Canvas 上下文"));
            return;
          }

          ctx.drawImage(img, 0, 0, width, height);

          canvas.toBlob(
            (blob) => {
              if (!blob) {
                reject(new Error("压缩失败"));
                return;
              }
              resolve({
                size: blob.size,
                width,
                height,
                blob,
              });
            },
            file.type || "image/jpeg",
            quality
          );
        };
        img.onerror = () => reject(new Error("图片加载失败"));
        img.src = e.target?.result as string;
      };
      reader.onerror = () => reject(new Error("文件读取失败"));
      reader.readAsDataURL(file);
    });
  };

  // 删除图片
  const handleDelete = (uid: string) => {
    setCompressionImageList((prev) => prev.filter((item) => item.uid !== uid));
    setSelectedRowKeys((prev) => prev.filter((key) => key !== uid));
    message.success("删除成功");
  };

  // 批量删除
  const handleBatchDelete = () => {
    if (selectedRowKeys.length === 0) {
      message.warning("请先选择要删除的图片");
      return;
    }
    setCompressionImageList((prev) =>
      prev.filter((item) => !selectedRowKeys.includes(item.uid))
    );
    setSelectedRowKeys([]);
    message.success("删除成功");
  };

  // 表格列定义
  const columns: TableColumnsType<CompressionImageType> = [
    {
      title: `已选(${selectedRowKeys.length}/${compressionImageList.length})`,
      dataIndex: "name",
      key: "name",
      ellipsis: true,
      onCell: () => ({
        style: {
          maxWidth: 120,
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
        },
      }),
    },
    {
      title: "原始大小",
      key: "size",
      render: (_, record) => formatFileSize(record.size),
    },
    {
      title: "原始尺寸",
      key: "dimensions",
      render: (_, record) => formatImageSize(record.width, record.height),
    },
    {
      title: "压缩后大小",
      key: "compressedSize",
      render: (_, record) =>
        record.compressedSize ? formatFileSize(record.compressedSize) : "-",
    },
    {
      title: "压缩后尺寸",
      key: "compressedDimensions",
      render: (_, record) =>
        formatImageSize(record.compressedWidth, record.compressedHeight),
    },
    {
      title: "压缩状态",
      key: "compressionStatus",
      render: (_, record) => {
        const status = record.compressionStatus || "pending";
        const statusMap = {
          pending: { text: "待压缩", color: "default" },
          compressing: { text: "压缩中", color: "processing" },
          compressed: { text: "已压缩", color: "success" },
        };
        const statusInfo = statusMap[status];
        return <Tag color={statusInfo.color}>{statusInfo.text}</Tag>;
      },
    },
    {
      title: "操作",
      key: "action",
      render: (_, record) => (
        <Button
          type="link"
          icon={<CompressOutlined />}
          onClick={() => handleCompress(record)}
          disabled={record.compressionStatus === "compressing"}
        >
          压缩
        </Button>
      ),
    },
    {
      title: "删除",
      key: "delete",
      render: (_, record) => (
        <Button
          type="link"
          danger
          icon={<DeleteOutlined />}
          onClick={() => handleDelete(record.uid)}
        >
          删除
        </Button>
      ),
    },
  ];

  // 行选择配置
  const rowSelection: TableRowSelection<CompressionImageType> = {
    selectedRowKeys,
    onChange: (selectedKeys) => {
      setSelectedRowKeys(selectedKeys);
    },
  };

  const beforeUpload: UploadProps["beforeUpload"] = (file) => {
    const isValidType =
      file.type === "image/jpeg" ||
      file.type === "image/jpg" ||
      file.type === "image/png" ||
      file.type === "image/gif";
    if (!isValidType) {
      message.error("只支持 jpg、jpeg、png、gif 格式的图片！");
      return Upload.LIST_IGNORE;
    }
    return false; // 阻止自动上传
  };

  // 监听文件选择变化的回调
  const handleChange: UploadProps["onChange"] = (info) => {
    const { fileList } = info;

    // 过滤掉无效的文件（被 beforeUpload 拒绝的文件不会出现在 fileList 中）
    const validFiles = fileList.filter((file) => {
      const isValidType =
        file.type === "image/jpeg" ||
        file.type === "image/jpg" ||
        file.type === "image/png" ||
        file.type === "image/gif";
      return isValidType && file.status !== "error";
    });

    // 使用防抖，确保只执行一次
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(async () => {
      // 为每个文件获取尺寸信息
      const filesWithDimensions = await Promise.all(
        validFiles.map(async (file) => {
          const originFile = file.originFileObj || file;
          try {
            const dimensions = await getImageDimensions(originFile as File);
            return {
              uid: file.uid,
              name: file.name,
              size: file.size || 0,
              type: file.type || "",
              originFileObj: originFile as File,
              width: dimensions.width,
              height: dimensions.height,
              compressionStatus: "pending" as const,
            };
          } catch (error) {
            console.error(`获取图片 ${file.name} 尺寸失败:`, error);
            return {
              uid: file.uid,
              name: file.name,
              size: file.size || 0,
              type: file.type || "",
              originFileObj: originFile as File,
              compressionStatus: "pending" as const,
            };
          }
        })
      );

      // 更新文件列表到状态中（包含尺寸信息）
      setCompressionImageList(filesWithDimensions);

      // 可以在这里添加其他处理逻辑
      console.log("选择的文件列表（包含尺寸）:", filesWithDimensions);
      debounceTimerRef.current = null;
    }, 300); // 300ms 内的多次调用会被合并为一次
  };

  return (
    <div className="detail-right">
      <Flex gap={2} align="center" style={{ height: 40 }}>
        <Upload
          multiple
          showUploadList={false}
          accept="image/jpeg,image/jpg,image/png,image/gif"
          beforeUpload={beforeUpload}
          onChange={handleChange}
        >
          <Button
            className="upload-btn"
            type="text"
            icon={
              <FileAddOutlined style={{ color: "#3069f2", fontSize: 14 }} />
            }
          >
            添加图片
          </Button>
        </Upload>
        <Button
          type="link"
          disabled={selectedRowKeys.length === 0}
          style={{ marginLeft: "auto" }}
          icon={<DeleteOutlined />}
          onClick={handleBatchDelete}
        >
          批量删除
        </Button>
      </Flex>
      <div style={{ flex: 1, minHeight: 0 }}>
        <Table
          columns={columns}
          dataSource={compressionImageList}
          rowKey="uid"
          rowSelection={rowSelection}
          pagination={false}
          scroll={{
            y: "calc(100vh - 320px)",
            x: true,
          }}
          style={{ height: "100%" }}
        />
      </div>

      <Flex vertical justify="space-around" className="detail-bottom-tools">
        <Flex align="flex-start">
          <span className="detail-bottom-tools-title">压缩模式：</span>
          <Radio className="detail-bottom-tools-radio">自定义</Radio>
          <Radio className="detail-bottom-tools-radio">缩小优先</Radio>
          <Radio className="detail-bottom-tools-radio">均衡压缩</Radio>
          <Radio className="detail-bottom-tools-radio">清晰优先</Radio>
        </Flex>
        <Flex align="start">
          <span className="detail-bottom-tools-title">输出格式：</span>
          <Radio className="detail-bottom-tools-radio">原格式</Radio>
          <Radio className="detail-bottom-tools-radio">转为JPG</Radio>
        </Flex>
        <Flex align="start">
          <span className="detail-bottom-tools-title">输出目录：</span>
          <Radio className="detail-bottom-tools-radio">原文件夹</Radio>
          <Radio className="detail-bottom-tools-radio">自定义</Radio>
        </Flex>
      </Flex>
    </div>
  );
};

const SelectImageView = () => {
  const [, setCompressionImageList] = useAtom(compressionImageListAtom);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // 组件卸载时清理定时器
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  const beforeUpload: UploadProps["beforeUpload"] = (file) => {
    const isValidType =
      file.type === "image/jpeg" ||
      file.type === "image/jpg" ||
      file.type === "image/png" ||
      file.type === "image/gif";
    if (!isValidType) {
      message.error("只支持 jpg、jpeg、png、gif 格式的图片！");
      return Upload.LIST_IGNORE;
    }
    return false; // 阻止自动上传
  };

  // 监听文件选择变化的回调
  const handleChange: UploadProps["onChange"] = (info) => {
    const { fileList } = info;

    // 过滤掉无效的文件（被 beforeUpload 拒绝的文件不会出现在 fileList 中）
    const validFiles = fileList.filter((file) => {
      const isValidType =
        file.type === "image/jpeg" ||
        file.type === "image/jpg" ||
        file.type === "image/png" ||
        file.type === "image/gif";
      return isValidType && file.status !== "error";
    });

    // 使用防抖，确保只执行一次
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(async () => {
      // 为每个文件获取尺寸信息
      const filesWithDimensions = await Promise.all(
        validFiles.map(async (file) => {
          const originFile = file.originFileObj || file;
          try {
            const dimensions = await getImageDimensions(originFile as File);
            return {
              uid: file.uid,
              name: file.name,
              size: file.size || 0,
              type: file.type || "",
              originFileObj: originFile as File,
              width: dimensions.width,
              height: dimensions.height,
              compressionStatus: "pending" as const,
            };
          } catch (error) {
            console.error(`获取图片 ${file.name} 尺寸失败:`, error);
            return {
              uid: file.uid,
              name: file.name,
              size: file.size || 0,
              type: file.type || "",
              originFileObj: originFile as File,
              compressionStatus: "pending" as const,
            };
          }
        })
      );

      // 更新文件列表到状态中（包含尺寸信息）
      setCompressionImageList(filesWithDimensions);

      // 可以在这里添加其他处理逻辑
      console.log("选择的文件列表（包含尺寸）:", filesWithDimensions);
      debounceTimerRef.current = null;
    }, 300); // 300ms 内的多次调用会被合并为一次
  };

  return (
    <div className="detail-right">
      <div className="detail-right-center">
        <Dragger
          multiple
          showUploadList={false}
          accept="image/jpeg,image/jpg,image/png,image/gif"
          beforeUpload={beforeUpload}
          onChange={handleChange}
        >
          <p className="ant-upload-drag-icon">
            <InboxOutlined />
          </p>
          <p className="ant-upload-text">
            将图片文件拖拽到此处，也可以点击本区域添加图片
          </p>
          <p className="ant-upload-hint">*支持jpg、jpeg、png、gif格式的图片</p>
        </Dragger>
      </div>
      <div className="detail-right-bottom">
        <Flex gap={6} className="detail-bottom-item">
          <FileImageFilled style={{ fontSize: 40, color: "#b1cffb" }} />
          <Flex vertical justify="center">
            <span className="detail-bottom-title">第一步：添加文件</span>
            <span className="detail-bottom-subTitle">支持批量添加文件</span>
          </Flex>
        </Flex>
        <RightOutlined style={{ fontSize: 20, color: "#b8cdeb" }} />
        <Flex gap={6} className="detail-bottom-item">
          <SettingFilled style={{ fontSize: 40, color: "#b1cffb" }} />
          <Flex vertical justify="center">
            <span className="detail-bottom-title">第二步：设置压缩参数</span>
            <span className="detail-bottom-subTitle">
              支持自定义压缩，缩小优先等模式
            </span>
          </Flex>
        </Flex>
        <RightOutlined style={{ fontSize: 20, color: "#b8cdeb" }} />
        <Flex gap={6} className="detail-bottom-item">
          <ProductFilled style={{ fontSize: 40, color: "#b1cffb" }} />
          <Flex vertical justify="center">
            <span className="detail-bottom-title">第三步：开始压缩</span>
            <span className="detail-bottom-subTitle">点击压缩按钮开始压缩</span>
          </Flex>
        </Flex>
      </div>
    </div>
  );
};

// 获取图片尺寸的工具函数
const getImageDimensions = (
  file: File
): Promise<{ width: number; height: number }> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url); // 释放内存
      resolve({
        width: img.naturalWidth,
        height: img.naturalHeight,
      });
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("无法读取图片尺寸"));
    };

    img.src = url;
  });
};

export default ImageCompression;
