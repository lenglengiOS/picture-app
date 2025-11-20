import React from "react";
import TitleBar from "@src/components/TitleBar";
import styled from "styled-components";
import Home from "@src/pages/home/Home";

const AppContainer = styled.div`
  display: flex;
  flex-direction: column;
  background-color: #e9edf8;
  flex: 1;
`;

export default function App() {
  return (
    <AppContainer>
      <TitleBar />
      <Home />
    </AppContainer>
  );
}
