import Axios from "axios";

const axios = Axios.create({
  baseURL: "http://localhost:3002/",
  timeout: 3000,
  headers: {},
});

export type DocList = {
  title: string;
  lastModified: number;
  docId: string;
}[];

export const queryDocList = async (): Promise<DocList> => {
  const res = await axios.get("/doclist");
  return res.data.list;
};

export const loginOrRegister = async (userName: string, password: string) => {
  const res = await axios.post("/login", { userName, password });
  return res.data;
};
