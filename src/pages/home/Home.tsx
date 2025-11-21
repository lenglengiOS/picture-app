import React from "react";
import { useAtom } from "jotai";
import { showDetailAtom } from "@src/store/home";
import "./Home.css";

const Home = () => {
  return (
    <div className="home-page">
      {/* 图片压缩 */}
      <div className="type-content">
        {/* 标题 */}
        <div className="title-view">
          <div className="title-line" />
          <span className="title-text">图片压缩</span>
        </div>

        {/* 卡片内容 */}
        <div className="card">
          <Item
            title="JPG压缩"
            icon={require("@src/assets/jpg.png")}
            index={1}
          />
        </div>
      </div>

      {/* 图片转换 */}
      <div className="type-content">
        {/* 标题 */}
        <div className="title-view">
          <div className="title-line" />
          <span className="title-text">图片转换</span>
        </div>

        {/* 卡片内容 */}
        <div className="card">
          <Item title="JPG压缩" icon={require("@src/assets/jpg.png")} />
          <Item title="PNG压缩" icon={require("@src/assets/jpg.png")} />
          <Item title="GIF压缩" icon={require("@src/assets/jpg.png")} />
        </div>
      </div>

      {/* 图片处理 */}
      <div className="type-content">
        {/* 标题 */}
        <div className="title-view">
          <div className="title-line" />
          <span className="title-text">图片处理</span>
        </div>

        {/* 卡片内容 */}
        <div className="card">
          <Item title="JPG压缩" icon={require("@src/assets/jpg.png")} />
          <Item title="PNG压缩" icon={require("@src/assets/jpg.png")} />
          <Item title="GIF压缩" icon={require("@src/assets/jpg.png")} />
        </div>
      </div>
    </div>
  );
};

const Item = ({ icon, title = "", index }: any) => {
  const [, setDetail] = useAtom(showDetailAtom);

  const goToDetail = () => {
    setDetail(index);
  };

  return (
    <div onClick={goToDetail} className="item">
      <img src={icon} className="item-img" />
      <span className="item-title">{title}</span>
    </div>
  );
};

export default Home;
