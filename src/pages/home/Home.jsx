import React from "react";
import { Button } from "@material-ui/core";
import { useAtom } from "jotai";
import { showDetailAtom } from "@src/store/home";
import "./Home.css";

const Home = () => {
  const [, setDetail] = useAtom(showDetailAtom);

  const goToDetail = () => {
    setDetail(1);
  };

  return (
    <div className="home-page">
      <Button onClick={goToDetail}>压缩图片</Button>
    </div>
  );
};

export default Home;
