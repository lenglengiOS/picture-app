import React from "react";
import TitleBar from "@src/components/TitleBar";
import styled from "styled-components";
import Home from "@src/pages/home/Home";
import Detail from "@src/pages/detail/Detail";
import { useAtom } from "jotai";
import { showDetailAtom } from "@src/store/home";
import { App } from "antd";

const AppContainer = styled.div`
  display: flex;
  flex-direction: column;
  background-color: #e9edf8;
  flex: 1;
`;

export default function PictureApp() {
  const [detail] = useAtom(showDetailAtom);

  return (
    <App>
      <AppContainer>
        <TitleBar />
        {detail === 0 && <Home />}
        {detail === 1 && <Detail />}
      </AppContainer>
    </App>
  );
}
