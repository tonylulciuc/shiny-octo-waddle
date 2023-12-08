import { Button, ButtonGroup } from "@mui/material";
import { useAuth } from "../Auth/AuthProvider";
import useAxios from "axios-hooks";


export default function Logout() {
    const [, executeLogout] = useAxios({
        url: '/logout',
        method: 'POST'
      }, { manual: true, });
    const { logout } = useAuth();

    return (
        <ButtonGroup>
            <Button onClick={() => {
                executeLogout()
                    .then(logout)
            }}>Logout</Button>
        </ButtonGroup>
    )
}