import AccountCircle from '@mui/icons-material/AccountCircle';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import MoreIcon from '@mui/icons-material/MoreVert';
import SearchIcon from '@mui/icons-material/Search';
import { LinearProgress, Tooltip, linearProgressClasses } from '@mui/material';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import InputBase from '@mui/material/InputBase';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import { alpha, styled } from '@mui/material/styles';
import useAxios from 'axios-hooks';
import * as React from 'react';
import { useEffect, useState } from 'react';
import { atom, useRecoilState } from 'recoil';
import { useAuth } from '../Auth/AuthProvider';
import { useToggle } from '@uidotdev/usehooks';
import FileUploadModal from '../FileUploadModal/FileUploadModal';

type StorageSpace = {
 total_space: number;
 free_space: number;
 used_space: number;
 percent_used: number;
}

export const searchState = atom<string | null>({
  key: 'searchState',
  default: null
});

export const storageSpaceState = atom<StorageSpace>({
  key: 'storageSpaceState',
  default: {
    total_space: 0,
    free_space: 0,
    used_space: 0,
    percent_used: 0,
  }
})

export const BorderLinearProgress = styled(LinearProgress)(({ theme }: any) => ({
  height: 10,
  borderRadius: 5,
  width: 100,
  marginTop: 5,
  [`&.${linearProgressClasses.colorPrimary}`]: {
    backgroundColor: theme.palette.grey[theme.palette.mode === 'light' ? 200 : 800],
  },
  [`& .${linearProgressClasses.bar}`]: {
    borderRadius: 5,
    backgroundColor: theme.palette.mode === 'light' ? '#1a90ff' : '#308fe8',
  },
}));

const Search = styled('div')(({ theme }) => ({
  position: 'relative',
  borderRadius: theme.shape.borderRadius,
  backgroundColor: alpha(theme.palette.common.white, 0.15),
  '&:hover': {
    backgroundColor: alpha(theme.palette.common.white, 0.25),
  },
  marginRight: theme.spacing(2),
  marginLeft: 0,
  width: '100%',
  [theme.breakpoints.up('sm')]: {
    marginLeft: theme.spacing(3),
    width: 'auto',
  },
}));

const SearchIconWrapper = styled('div')(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: '100%',
  position: 'absolute',
  pointerEvents: 'none',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: 'inherit',
  '& .MuiInputBase-input': {
    padding: theme.spacing(1, 1, 1, 0),
    // vertical padding + font size from searchIcon
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create('width'),
    width: '100%',
    [theme.breakpoints.up('md')]: {
      width: '20ch',
    },
  },
}));

export default function PrimarySearchAppBar() {
  const [, executeLogout] = useAxios({
    url: '/logout',
    method: 'POST'
  }, { manual: true, });
  const [, executeStorageSpace] = useAxios<StorageSpace>({
    url: '/storage/space',
    method: 'GET'
  });
  const { logout } = useAuth();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [mobileMoreAnchorEl, setMobileMoreAnchorEl] =
    useState<null | HTMLElement>(null);
  const [searchValue, setSearch] = useRecoilState(searchState);
  const isMenuOpen = Boolean(anchorEl);
  const isMobileMenuOpen = Boolean(mobileMoreAnchorEl);
  const [storageSpace, setStorageSpace] = useRecoilState(storageSpaceState);
  const [memoryTooltipTitle, setMemoryTooltip] = useState<string>('Memory in use: 0 B / 0 B');
  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const [openFileUpload, toggleFileUpload] = useToggle(false);

  const handleMobileMenuClose = () => {
    setMobileMoreAnchorEl(null);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    handleMobileMenuClose();
  };

  const handleMobileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setMobileMoreAnchorEl(event.currentTarget);
  };

  const menuId = 'primary-search-account-menu';
  const renderMenu = (
    <Menu
      anchorEl={anchorEl}
      anchorOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
      id={menuId}
      keepMounted
      transformOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
      open={isMenuOpen}
      onClose={handleMenuClose}
    >
      <MenuItem onClick={() => {
        handleMenuClose();
        executeLogout()
          .then(logout)
      }}>Logout</MenuItem>
    </Menu>
  );

  const mobileMenuId = 'primary-search-account-menu-mobile';
  const renderMobileMenu = (
    <Menu
      anchorEl={mobileMoreAnchorEl}
      anchorOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
      id={mobileMenuId}
      keepMounted
      transformOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
      open={isMobileMenuOpen}
      onClose={handleMobileMenuClose}
    >
      <MenuItem>
        <IconButton
          size="large"
          aria-label="upload content"
          title='Upload file'
          color="inherit"
        >
          <CloudUploadIcon />
        </IconButton>
        <p>Upload</p>
      </MenuItem>
      <MenuItem onClick={handleProfileMenuOpen}>
        <IconButton
          size="large"
          aria-label="account of current user"
          aria-controls="primary-search-account-menu"
          aria-haspopup="true"
          color="inherit"
        >
          <AccountCircle />
        </IconButton>
        <p>Profile</p>
      </MenuItem>
    </Menu>
  );

  useEffect(() => {
    const intervalId = setInterval(() => {
      executeStorageSpace().then(({ data }) => setStorageSpace(data)).catch(() => {})
    }, 2000);

    return () => {
      clearInterval(intervalId);
    };
  }, [executeStorageSpace, setStorageSpace]);


  useEffect(() => {
    const { used_space, total_space } = storageSpace;
    const b = used_space;
    const kb = b / 1000;
    const mb = kb / 1000;
    const gb = mb / 1000;
    const tb = gb / 1000;
    const denominator = (total_space / (1000 * 1000 * 1000 * 1000)).toFixed(2);
    let numerator = `${b} B`;

    if (kb >= 1) {
      numerator = `${kb.toFixed(2)} KB`;
    }

    if (mb >= 1) {
      numerator = `${mb.toFixed(2)} MB`;
    }

    if (gb >= 1) {
      numerator = `${gb.toFixed(2)} GB`;
    }

    if (tb >= 1) {
      numerator = `${tb.toFixed(2)} TB`;
    }

    setMemoryTooltip(`Memory in use: ${numerator} / ${denominator} TB`)

  }, [storageSpace, setMemoryTooltip]);

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          <Typography
            variant="h6"
            noWrap
            component="div"
            sx={{ display: { xs: 'none', sm: 'block' } }}
          >
            File Server
          </Typography>
          <Search>
            <SearchIconWrapper>
              <SearchIcon />
            </SearchIconWrapper>
            <StyledInputBase
              placeholder="Search…"
              inputProps={{ 'aria-label': 'search' }}
              onChange={(e) => setSearch(e.target?.value ?? null)}
              value={searchValue ?? ''}
            />
          </Search>
          <Tooltip title={memoryTooltipTitle}>
            <Box sx={{ display: 'flex' }}>
              <BorderLinearProgress variant="determinate" value={Number(storageSpace.percent_used)} />
              <span style={{ width: 8 }} />
              <Typography>{storageSpace.percent_used}%</Typography>
            </Box>
          </Tooltip>
          <Box sx={{ flexGrow: 1 }} />
          <Box sx={{ display: { xs: 'none', md: 'flex' } }}>
            <IconButton
              size="large"
              aria-label="upload content"
              title='Upload file'
              color="inherit"
              onClick={() => toggleFileUpload()}
            >
              <CloudUploadIcon />
            </IconButton>
            <IconButton
              size="large"
              edge="end"
              aria-label="account of current user"
              aria-controls={menuId}
              aria-haspopup="true"
              onClick={handleProfileMenuOpen}
              color="inherit"
            >
              <AccountCircle />
            </IconButton>
          </Box>
          <Box sx={{ display: { xs: 'flex', md: 'none' } }}>
            <IconButton
              size="large"
              aria-label="show more"
              aria-controls={mobileMenuId}
              aria-haspopup="true"
              onClick={handleMobileMenuOpen}
              color="inherit"
            >
              <MoreIcon />
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>
      {renderMobileMenu}
      {renderMenu}
      <FileUploadModal open={openFileUpload} onClose={toggleFileUpload} />
    </Box>
  );
}