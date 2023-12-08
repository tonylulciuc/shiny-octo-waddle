import { useMediaQuery } from '@mui/material';
import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { RecoilRoot } from 'recoil';
import './App.css';
import PrimarySearchAppBar from './component/AppBar/AppBar';
import AuthProvider from './component/Auth/AuthProvider';
import DirectoryTree from './component/DirectoryTree/DirectoryTree';

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
  },
});

const lightTheme = createTheme({
  palette: {
    mode: 'light',
  },
});

function App() {
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');

  return (
    <RecoilRoot>
      <ThemeProvider theme={prefersDarkMode ? darkTheme : lightTheme}>
        <CssBaseline />
        <div className="App">
          <AuthProvider>
              <PrimarySearchAppBar />
              <DirectoryTree />
          </AuthProvider>
        </div>
      </ThemeProvider>
    </RecoilRoot>
  );
}

export default App;
