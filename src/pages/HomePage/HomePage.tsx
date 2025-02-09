import { useEffect, useState } from "react";
import "./HomePage.scss";
import { DocList, loginOrRegister, queryDocList } from "../../network";

import NavBar from "./NavBar/NavBar";
import DocItem from "./DocItem/DocItem";
import { generateRandomString } from "../../utils";
import { useDispatch } from "react-redux";
import { distoryClient } from "../../lib/ot";
import { init, setUser } from "../../store/docSlice";
import { Button, Modal, Input } from "antd";
import { useSelector } from "react-redux";
import { RootState } from "../../store";
import { useNavigate } from "react-router";

function HomePage() {
  const [list, setList] = useState<DocList>([]);
  const navigate = useNavigate();

  const dispatch = useDispatch();

  useEffect(() => {
    queryDocList().then((res) => {
      setList(res);
    });

    // 每次进入该页面，store初始化，销毁client
    dispatch(init());
    distoryClient();
  }, [dispatch]);

  const [open, setOpen] = useState(false);

  const user = useSelector((state: RootState) => state.doc.user.id);

  useEffect(() => {
    if (!user) {
      setOpen(true);
    }
  }, [user]);

  useEffect(() => {
    window.document.title = "Apollo";
  }, []);

  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    if (!userName || !password) {
      console.log("请输入用户名和密码");
      return;
    }

    const res = await loginOrRegister(userName, password);

    if (res.data) {
      dispatch(setUser(res.data));
      setOpen(false);
    }
  };

  return (
    <div className="home-page">
      <NavBar />
      <div className="home-page-container">
        <div className="home-page-container-wrap">
          <div className="home-page-title">
            <h2>所有文档</h2>
            <div
              className="home-page-new-btn"
              onClick={() => {
                // 只能新打开页面，因为当前页面已经绑定socket
                // window.open(
                //   `${DOMAIN}/doc?id=${generateRandomString(8)}`,
                //   "_blank"
                // );
                navigate(`/doc?id=${generateRandomString(8)}`);
              }}
            >
              新建 ＋
            </div>
          </div>

          <div className="home-page-doc-list">
            {list.map((item) => {
              return <DocItem doc={item} />;
            })}
            {list.length === 0 && <div style={{ color: "grey" }}>暂无文档</div>}
          </div>
        </div>
      </div>
      <Modal
        open={open}
        title="请登录"
        width={480}
        closable={false}
        footer={() => <Button onClick={handleLogin}>登录！</Button>}
      >
        <div className="modal-content">
          <Input
            placeholder="昵称"
            style={{
              width: "200px",
              margin: "4px",
              marginTop: "20px",
            }}
            value={userName}
            onChange={(e) => {
              setUserName(e.target.value);
            }}
          />
          <Input
            placeholder="密码"
            style={{
              width: "200px",
              margin: "4px",
            }}
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
            }}
          />
          <div style={{ fontSize: "12px", color: "grey" }}>
            初次登录将会自动注册
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default HomePage;
