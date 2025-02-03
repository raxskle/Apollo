import "./NavBar.scss";
import IconButton from "@mui/material/IconButton";
import Avatar from "@mui/material/Avatar";
import { styled } from "@mui/material/styles";
import SettingIcon from "../../../assets/icons/setting.svg";
import ExpandIcon from "../../../assets/icons/expand.svg";
import CommentIcon from "../../../assets/icons/comment.svg";
import Divider from "@mui/material/Divider";
import AvatarGroup from "@mui/material/AvatarGroup";
import { useDispatch, useSelector } from "react-redux";
import { changeDocumentTitle } from "../../../store/docSlice.ts";
import { getRelativeTime } from "../../../utils/index.ts";
import { RootState } from "../../../store/index.ts";
import { switchShowCommentBar } from "../../../store/viewSlice.ts";
import { getSocket } from "../../../network/index.ts";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";

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

  return (
    <div className="navbar">
      <div className="navbar-left">
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
          <div className="tipbar-last-edit">最近修改：{relativeTime}</div>
        )}
      </div>

      <div className="navbar-right">
        <div className="collaborator-list">
          <AvatarGroup total={collaborator.length}>
            {collaborator.slice(0, 4).map((item) => {
              return (
                <Avatar
                  alt={item.name}
                  style={{ background: item.displayColor }}
                >
                  {item.name}
                </Avatar>
              );
            })}
          </AvatarGroup>
        </div>

        <Divider orientation="vertical" flexItem />
        <div
          className="comment"
          onClick={() => {
            dispatch(switchShowCommentBar());
          }}
        >
          <BootstrapIconButton
            color="primary"
            aria-label="add to shopping cart"
          >
            <img src={CommentIcon} />
          </BootstrapIconButton>
        </div>
        <div className="setting">
          <BootstrapIconButton
            color="primary"
            aria-label="add to shopping cart"
          >
            <img src={SettingIcon} />
          </BootstrapIconButton>
        </div>
        <div className="user">
          <BootstrapIconButton
            color="primary"
            aria-label="add to shopping cart"
          >
            <Avatar
              alt="Remy Sharp"
              style={{ width: "30px", height: "30px" }}
              src="https://s1-imfile.feishucdn.com/static-resource/v1/v2_051b6637-4422-4383-ac7a-2afd283653fg~?image_size=noop&cut_type=&quality=&format=image&sticker_format=.webp"
            >
              N
            </Avatar>
          </BootstrapIconButton>
        </div>
      </div>
    </div>
  );
}
