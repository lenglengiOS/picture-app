import React from "react";
import { Button } from "@material-ui/core";
import { useAtom } from "jotai";
import { showDetailAtom } from "@src/store/home";
import "./Detail.css";

const Detail = () => {
  const [detail, setDetail] = useAtom(showDetailAtom);

  const goToDetail = () => {
    setDetail(1);
  };

  return (
    <div className="detail-page">
      <Button onClick={goToDetail}>压缩图片详情页面</Button>
    </div>
  );
};

export default Detail;
