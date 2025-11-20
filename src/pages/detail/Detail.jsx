import React from "react";
import { Button } from "@material-ui/core";
import { useAtom } from "jotai";
import { showDetailAtom } from "@src/store/home";
import "./Detail.css";

const Detail = () => {
  const [detail, setDetail] = useAtom(showDetailAtom);

  return <div className="detail-page"></div>;
};

export default Detail;
