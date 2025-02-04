import { Avatar } from "@mui/material";
import { BootstrapIconButton } from "../../EditorPage/NavBar/NavBar";
import "./NavBar.scss";
import { useSelector } from "react-redux";
import { RootState } from "../../../store";

function NavBar() {
  const user = useSelector((state: RootState) => state.doc.user);
  return (
    <div className="nav-bar">
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
  );
}

export default NavBar;
