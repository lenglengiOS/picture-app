import React, { useRef, useEffect } from "react";
import { useAtom } from "jotai";
import { compressionImageListAtom, showDetailAtom } from "@src/store/home";
import { Flex } from "antd";
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
} from "@ant-design/icons";
import { InboxOutlined } from "@ant-design/icons";
import type { UploadProps } from "antd";
import { message, Upload } from "antd";
import "./ImageCompression.css";
const { Dragger } = Upload;

const ImageCompression = () => {
  const [compressionImageList] = useAtom(compressionImageListAtom);

  // 未选择图片时，展示选择图片组件
  if (compressionImageList.length === 0) {
    return <SelectImageView />;
  }

  // 已选择图片，展示图片列表和处理页面
  return <CompressionImageListView />;
};

const CompressionImageListView = () => {
  return (
    <div className="detail-right">
      <Flex>
        <p>添加图片</p>
        <p>添加文件夹</p>
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
            };
          } catch (error) {
            console.error(`获取图片 ${file.name} 尺寸失败:`, error);
            return {
              uid: file.uid,
              name: file.name,
              size: file.size || 0,
              type: file.type || "",
              originFileObj: originFile as File,
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

export default ImageCompression;
