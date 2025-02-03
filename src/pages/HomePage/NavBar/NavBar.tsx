import { Avatar } from "@mui/material";
import { BootstrapIconButton } from "../../EditorPage/NavBar/NavBar";
import "./NavBar.scss";

function NavBar() {
  return (
    <div className="nav-bar">
      <div className="user">
        <BootstrapIconButton color="primary" aria-label="add to shopping cart">
          <Avatar
            alt="Remy Sharp"
            style={{ width: "30px", height: "30px" }}
            src="https://s1-imfile.feishucdn.com/static-resource/v1/v2_051b6637-4422-4383-ac7a-2afd283653fg~?image_size=noop&cut_type=&quality=&format=image&sticker_format=.webp"
          ></Avatar>
        </BootstrapIconButton>
      </div>
    </div>
  );
}

export default NavBar;
