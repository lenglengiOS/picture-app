import React from "react";
import { useAtom } from "jotai";
import { showDetailAtom } from "@src/store/home";
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
} from "@material-ui/core";
import { ExpandMore } from "@material-ui/icons";
import "./Detail.css";

async function selectImage() {
  return await window.electronAPI.selectImage();
}

async function selectOutputFolder() {
  return await window.electronAPI.selectOutputFolder();
}

async function compressImage(options) {
  return await window.electronAPI.compressImage(options);
}

const Detail = () => {
  const [detail, setDetail] = useAtom(showDetailAtom);

  // 示例使用
  async function runCompress() {
    const inputPath = await selectImage();
    if (!inputPath) return alert("未选择图片");

    const outputDir = await selectOutputFolder();
    if (!outputDir) return alert("未选择输出目录");

    const outputPath = `${outputDir}/compressed.jpg`;

    const result = await compressImage({
      inputPath,
      outputPath,
      width: 800,
      height: null,
      quality: 80,
      maxSizeKB: 200,
    });

    console.log("压缩成功", result);
  }

  return (
    <div className="detail-page">
      <Menus />
    </div>
  );
};

const Menus = () => {
  return <div className="left"></div>;
};

export default Detail;
