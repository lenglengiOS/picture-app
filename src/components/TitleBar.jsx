import React from "react";
import styled from "styled-components";
import Button from "@material-ui/core/Button";
import { useAtom } from "jotai";
import { showDetailAtom } from "@src/store/home";
import "./TitleBar.css";

const ToolbarContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-left: 68px;
  height: 40px; /* 保留空间，不覆盖系统标题栏 */
  color: white;
  box-sizing: border-box;
  -webkit-app-region: drag; /* ⚡ 整个 TitleBar 可拖动 */
`;

const ToolbarLeft = styled.div`
  display: flex;
  align-items: center;
`;

const ToolbarRight = styled.div`
  display: flex;
  align-items: center;
`;

export default function Toolbar() {
  const [, setDetail] = useAtom(showDetailAtom);

  const goHome = () => {
    setDetail(0);
  };

  return (
    <ToolbarContainer>
      <ToolbarLeft>
        <img
          onClick={goHome}
          className="logo"
          src={require("../../build/icon.png")}
        />
        <Button class="home-btn" variant="text" onClick={goHome}>
          阳光图片转换器
        </Button>
      </ToolbarLeft>
      <ToolbarRight>
        <Button>搜索</Button>
        <Button>设置</Button>
      </ToolbarRight>
    </ToolbarContainer>
  );
}
