import { Button, Card, FormControl, FormHelperText, TextField, Typography } from "@mui/material";
import useAxios from "axios-hooks";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "../Auth/AuthProvider";
import { Error } from "@mui/icons-material";

export const LogoutButton = () => {
  const { logout } = useAuth();

  return <button onClick={logout}>Logout</button>;
};

export const Login = () => {
  const userRef = useRef<HTMLInputElement>(null);
  const [user, setUser] = useState("");
  const [pwd, setPwd] = useState("");
  const [{ error }, onLogin] = useAxios({
    url: '/login',
    method: 'POST'
  }, { manual: true, });
  const { login } = useAuth();
  
  useEffect(() => {
    userRef.current?.focus();
  }, []);


  return (
    <Card elevation={10}>
      <form 
        onSubmit={(e) => {
          e.preventDefault();
          onLogin({
            data: {
              username: user,
              password: pwd,
            }
          }).then(({ data: { access_token } }) => {
            login(access_token);
          }).catch((e) => {
            console.error('failed to sign in');
          });
        }}
        style={{ 
          padding: 24
        }}
      
      >
        <section>
          <Typography variant="h3" >Sign In</Typography>
        </section>
        <span style={{ padding: 16 }}/>
        <section>
          <FormControl>
            <TextField
              required
              label="Username"
              value={user}
              onChange={(e) => setUser(e.target.value)}
            />
          </FormControl>
          <span style={{ padding: 16 }}/>
          <FormControl>
            <TextField
              required
              type="password"
              label="Password"
              value={pwd}
              onChange={(e) => setPwd(e.target.value)}
            />
          </FormControl>
        </section>
        <span style={{ padding: 16 }}/>
        <section>
          <Button
            type="submit"
            fullWidth
            variant="contained">
            Sign In
          </Button>
        </section>
        <section>
          {error && (
            <FormHelperText error={!!error}>
              <Typography variant="h6">*{error?.response?.data ?? error?.message}</Typography>
            </FormHelperText>
          )}
        </section>
      </form>
    </Card>
  );
};