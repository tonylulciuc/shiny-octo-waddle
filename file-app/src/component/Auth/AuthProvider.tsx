import { useEffect, useState } from "react";
import { atom, useRecoilState } from "recoil";
import { Login } from "../Login/Login";
import useAxios from "axios-hooks";

const tokenState = atom<string | null>({
  key: 'tokenState',
  default: null, 
});

export const useLocalStorage = () => {
  const [value, setValue] = useState<string | null>(null);

  const setItem = (key: string, value: string) => {
    localStorage.setItem(key, value);
    setValue(value);
  };

  const getItem = (key: string) => {
    const value = localStorage.getItem(key);
    setValue(value);
    return value;
  };

  const removeItem = (key: string) => {
    localStorage.removeItem(key);
    setValue(null);
  };

  return { value, setItem, getItem, removeItem };
};

export const useUser = () => {
  const { setItem } = useLocalStorage();
  const [token, setUser] = useRecoilState(tokenState);


  const addUser = (token: string) => {
    setUser(token);
    setItem("token", token);
  };

  const removeUser = () => {
    setUser(null);
    setItem("token", "");
  };

  return { token, addUser, removeUser };
};

export const useAuth = () => {
  const { token, addUser, removeUser } = useUser();
  const { getItem } = useLocalStorage();

  useEffect(() => {
    const token = getItem("token");
    if (token) {
      addUser(token);
    }
  }, []);

  const login = (token: string) => {
    addUser(token);
  };

  const logout = () => {
    removeUser();
  };

  return { token, login, logout };
};

const useValidatePreviousAccess = () => {
  const { getItem } = useLocalStorage();
  const { logout } = useAuth();
  const [{ loading, response }]=  useAxios({
    url: '/validate',
    method: 'GET'
  });

  useEffect(() => {
    const token = getItem("token");

    if (loading || !token) {
      return;
    }
    
    const { status } = response ?? {};

    if (status === 200) {
      return;
    }
 
    logout();
  }, [loading, response]);
}

const AuthProvider = ({ children }: any) => {
  const { token } = useAuth();

  useValidatePreviousAccess();

  return (
    <>
      {token && children}
      {!token && (
      <header className="App-header">
        <Login />
      </header>
      )}
    </>
  )
}


export default AuthProvider;