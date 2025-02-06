import "./NavBar.scss";
import IconButton from "@mui/material/IconButton";
import Avatar from "@mui/material/Avatar";
import { styled } from "@mui/material/styles";
import FunctionIcon from "../../../assets/icons/function.svg";
import ExpandIcon from "../../../assets/icons/expand.svg";
import CommentIcon from "../../../assets/icons/comment.svg";
import SearchIcon from "../../../assets/icons/SearchIcon.svg";
import Divider from "@mui/material/Divider";
import AvatarGroup from "@mui/material/AvatarGroup";
import { useDispatch, useSelector } from "react-redux";
import { changeDocumentTitle } from "../../../store/docSlice.ts";
import { formatDate, getRelativeTime } from "../../../utils/index.ts";
import { RootState } from "../../../store/index.ts";
import { switchShowCommentBar } from "../../../store/viewSlice.ts";
import { getSocket } from "../../../network/index.ts";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import FunctionsMenu from "./FunctionsMenu/FunctionsMenu.tsx";
import { Tooltip } from "@mui/material";
import SearchBar from "./SearchBar/SearchBar.tsx";

export const BootstrapIconButton = styled(IconButton)({
  color: "black",
  padding: "4px",
  "&:hover": {
    background: "rgba(230, 230, 230, 0.5)",
  },
});

export function NavBar() {
  const { document, collaborator } = useSelector(
    (state: RootState) => state.doc
  );
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const relativeTime = getRelativeTime(document.lastModified);
  const [, forceUpdate] = useState({});

  useEffect(() => {
    const interval = setInterval(() => {
      forceUpdate({});
    }, 1000 * 60);
    return () => {
      clearInterval(interval);
    };
  }, []);

  const user = useSelector((state: RootState) => state.doc.user);

  return (
    <div className="navbar">
      <div className="navbar-left">
        <Tooltip
          title="文档列表"
          enterDelay={1000}
          slotProps={{
            popper: {
              modifiers: [
                {
                  name: "offset",
                  options: {
                    offset: [0, -8],
                  },
                },
              ],
            },
          }}
        >
          <BootstrapIconButton
            className="expand-icon"
            onClick={() => {
              navigate("/");
            }}
          >
            <img
              src={ExpandIcon}
              width="16px"
              height="16px"
              style={{ margin: "2px" }}
            />
          </BootstrapIconButton>
        </Tooltip>
        <div className="file-name-bar">
          <span className="file-name-input-mask">{document.title}</span>
          <input
            className="file-name-input-bar"
            value={document.title}
            onChange={(e) => {
              const socket = getSocket();
              socket.emit("changeDocTitle", e.target.value);
              dispatch(changeDocumentTitle({ title: e.target.value }));
            }}
          />
        </div>
        {document.lastModified !== 0 && (
          <Tooltip
            title={`创建日期：${formatDate(document.createdTime)}`}
            enterDelay={1000}
            slotProps={{
              popper: {
                modifiers: [
                  {
                    name: "offset",
                    options: {
                      offset: [20, -8],
                    },
                  },
                ],
              },
            }}
          >
            <div className="tipbar-last-edit">最近修改：{relativeTime}</div>
          </Tooltip>
        )}
      </div>

      <div className="navbar-right">
        <div className="collaborator-list">
          <Tooltip title="在线协同者" arrow>
            <AvatarGroup total={collaborator.length} max={4}>
              {collaborator.slice(0, 4).map((item) => {
                return (
                  <Avatar
                    alt={item.name}
                    style={{
                      width: "24px",
                      height: "24px",
                      fontSize: "10px",
                      background: item.displayColor,
                    }}
                  >
                    {item.name.slice(0, 4)}
                  </Avatar>
                );
              })}
            </AvatarGroup>
          </Tooltip>
        </div>

        <Divider orientation="vertical" flexItem />
        <div className="search" tabIndex={1}>
          <Tooltip
            title="搜索"
            enterDelay={1000}
            slotProps={{
              popper: {
                modifiers: [
                  {
                    name: "offset",
                    options: {
                      offset: [0, -8],
                    },
                  },
                ],
              },
            }}
          >
            <BootstrapIconButton color="primary">
              <img
                src={SearchIcon}
                style={{
                  marginLeft: "1px",
                  marginRight: "1px",
                  marginTop: "2px",
                  marginBottom: "0px",
                }}
              />
            </BootstrapIconButton>
          </Tooltip>
          <SearchBar />
        </div>
        <div className="comment">
          <Tooltip
            title="评论"
            enterDelay={1000}
            slotProps={{
              popper: {
                modifiers: [
                  {
                    name: "offset",
                    options: {
                      offset: [0, -8],
                    },
                  },
                ],
              },
            }}
          >
            <BootstrapIconButton
              color="primary"
              onClick={() => {
                dispatch(switchShowCommentBar());
              }}
            >
              <img src={CommentIcon} />
            </BootstrapIconButton>
          </Tooltip>
        </div>
        <div className="setting" tabIndex={1}>
          <Tooltip
            title="更多"
            enterDelay={1000}
            slotProps={{
              popper: {
                modifiers: [
                  {
                    name: "offset",
                    options: {
                      offset: [0, -8],
                    },
                  },
                ],
              },
            }}
          >
            <BootstrapIconButton color="primary">
              <img src={FunctionIcon} />
            </BootstrapIconButton>
          </Tooltip>
          <FunctionsMenu />
        </div>
        <div className="user">
          <BootstrapIconButton color="primary">
            <Avatar
              alt={user.name}
              style={{
                width: "30px",
                height: "30px",
                fontSize: "11px",
                backgroundColor: user.displayColor,
              }}
            >
              {user.name.slice(0, 4)}
            </Avatar>
          </BootstrapIconButton>
        </div>
      </div>
    </div>
  );
}
