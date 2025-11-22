import { atom } from "jotai";

// 0: 首页
// 1: 图片压缩
export const showDetailAtom = atom<number>(0);

// 选择的图片列表
export const compressionImageListAtom = atom<CompressionImageType[]>([]);

export type CompressionImageType = {
  uid: string;
  name: string;
  size: number;
  type: string;
  originFileObj: File;
  width?: number;
  height?: number;
};
