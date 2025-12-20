import React from "react";
import { useAtom } from "jotai";
import { showDetailAtom } from "@src/store/home";
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
} from "@material-ui/core";
import { Flex } from "antd";
import {
  BlockOutlined,
  MergeCellsOutlined,
  BorderInnerOutlined,
  PictureOutlined,
} from "@ant-design/icons";
import "./Detail.css";
import ImageCompression from "@src/components/ImageCompression";

const Detail = () => {
  const [detail, setDetail] = useAtom(showDetailAtom);

  return (
    <div className="detail-page">
      <Menus />
      {detail === 1 && <ImageCompression />}
    </div>
  );
};

const Menus = () => {
  const [detail, setDetail] = useAtom(showDetailAtom);
  return (
    <div className="left">
      <Flex gap={2} justify="center" align="center" className="item-group">
        <PictureOutlined style={{ fontSize: 18, marginRight: 2 }} />
        <span>图片处理</span>
      </Flex>

      <Flex
        justify="center"
        align="center"
        className={detail === 1 ? "menu-item-select" : "menu-item"}
      >
        <span>图片压缩</span>
      </Flex>

      {/* <Flex gap={2} justify="center" align="center" className="item-group">
        <BlockOutlined style={{ fontSize: 20, marginRight: 2 }} />
        <span>图片转换</span>
      </Flex> */}
    </div>
  );
};

export default Detail;
