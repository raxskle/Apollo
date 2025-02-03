import { useEffect, useState } from "react";
import "./HomePage.scss";
import { DocList, queryDocList } from "../../network";

import NavBar from "./NavBar/NavBar";
import DocItem from "./DocItem/DocItem";
import { DOMAIN, generateRandomString } from "../../utils";
import { useDispatch } from "react-redux";
import { distoryClient } from "../../lib/ot";
import { init } from "../../store/docSlice";

function HomePage() {
  const [list, setList] = useState<DocList>([]);

  const dispatch = useDispatch();

  useEffect(() => {
    queryDocList().then((res) => {
      setList(res);
    });

    // 每次进入该页面，store初始化，销毁client
    dispatch(init());
    distoryClient();
  }, [dispatch]);

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
                window.open(
                  `${DOMAIN}/doc?id=${generateRandomString(8)}`,
                  "_blank"
                );
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
    </div>
  );
}

export default HomePage;
