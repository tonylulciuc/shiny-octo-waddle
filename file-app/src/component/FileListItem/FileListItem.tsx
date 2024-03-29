import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import DownloadForOfflineIcon from '@mui/icons-material/DownloadForOffline';
import EditIcon from '@mui/icons-material/Edit';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { AccordionSummary, Card, CardContent, IconButton, Menu, MenuItem, Paper, TextField, Tooltip, Typography } from "@mui/material";
import { grey, red } from '@mui/material/colors';
import { useToggle } from '@uidotdev/usehooks';
import { AxiosProgressEvent } from 'axios';
import useAxios from 'axios-hooks';
import { useState } from 'react';
import ConfirmationModal from '../ConfirmationModal/ConfirmationModal';
import ProgressModal from '../ProgressModal/ProgressModal';

export interface FileListItemProps {
    file: string;
}

export default function FileListItem({ file }: FileListItemProps) {
    const [, executeEdit] = useAxios({
        url: `/file/${file}`,
        method: 'PUT'
    }, {
        manual: true
    });
    const [, executeDownload] = useAxios({
        url: `/file/${file}`,
        method: 'GET',
        responseType: 'blob'
    }, {
        manual: true
    });
    const [, executeDelete] = useAxios({
        url: `/file/${file}`,
        method: 'DELETE'
    }, {
        manual: true
    });
    const [open, toggle] = useToggle(false);
    const [deleted, toggleDeleted] = useToggle(false);
    const [edit, toggleEdit] = useToggle(false);
    const [fileName, setFileName] = useState(file);
    const [editFile, setEditFile] = useState<string>(file);
    const [confirmModalOpen, toggleConfirmModalOpen] = useToggle(false);
    const [progress, setProgress] = useState(0);
    const handleDownloadProgress = (progressEvent: AxiosProgressEvent) => {
        setProgress(Math.round((progressEvent.loaded * 100) / (progressEvent?.total ?? 0)));
    };
    const handleDownloadComplete = () => {
        toggle();
        setProgress(0);
    }
    const mobileMenuId = 'primary-search-account-menu-mobile';
    const [menuOpen, toggleMenuOpen] = useToggle(false);
    const [mobileMoreAnchorEl, setMobileMoreAnchorEl] = useState<null | HTMLElement>(null);

    const handleMenuClose = () => {
        setMobileMoreAnchorEl(null);
        toggleMenuOpen();
    };

    const handleMobileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
        event.stopPropagation();
        setMobileMoreAnchorEl(event.currentTarget);
        toggleMenuOpen();
    };

    return (
        <>
            <Card className='row' elevation={10} style={{ margin: 0, height: 80 }} >
                <CardContent
                    aria-controls="panel1a-content"
                    id="panel1a-header"
                    style={{ height: '100%',  width: '100%', display: 'flex' }}
                >
                    {edit && 
                        <TextField 
                            value={editFile} 
                            onBlur={() => toggleEdit()}
                            onChange={(e) => setEditFile(e.target.value)} 
                            onKeyDown={(e) => {
                                if(e.key !== 'Enter') {
                                    return;
                                }

                                executeEdit({
                                    data: {
                                        newName: editFile
                                    }
                                }).then(() => {
                                    toggleEdit();
                                    setFileName(editFile);
                                });

                                e.preventDefault()
                             }}
                        />
                    }
                    {!edit && 
                        <Tooltip title={file}>
                            <Typography noWrap overflow='hidden' textOverflow='ellipsis'>{fileName}</Typography>
                        </Tooltip>
                    }
                    <span style={{ marginLeft: 'auto' }} />
                    <IconButton
                        aria-label="show more"
                        aria-controls={mobileMenuId}
                        aria-haspopup="true"
                        onClick={handleMobileMenuOpen}
                        color="inherit"
                    >
                        <MoreVertIcon />
                    </IconButton>
                </CardContent>
            </Card>
            <Menu
                elevation={15}
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
                open={menuOpen}
                onClose={handleMenuClose}
            >
                <MenuItem
                    disabled={deleted}
                    onClick={() => {
                        toggleEdit();
                        handleMenuClose();
                    }}
                >
                    <EditIcon />
                    <Typography>Edit</Typography>
                </MenuItem>
                <MenuItem
                    disabled={deleted}
                    onClick={async () => {
                        toggle();
                        executeDownload({
                            onDownloadProgress: handleDownloadProgress,
                        })
                            .then((response) => {
                                const url = window.URL.createObjectURL(new Blob([response.data]));
                                const link = document.createElement('a');
                                const data = file.split('/');
                                const fileName = data[data.length - 1];

                                link.href = url;
                                link.setAttribute('download', fileName);
                                document.body.appendChild(link);
                                link.click();
                            })
                            .then(handleDownloadComplete)
                            .then(handleMenuClose)
                            .catch(handleDownloadComplete);
                    }}>

                    <DownloadForOfflineIcon />
                    <Typography>Download</Typography>
                </MenuItem>
                <MenuItem
                    disabled={deleted}
                    onClick={() => {
                        toggleConfirmModalOpen();
                        handleMenuClose();
                    }}
                >
                    <DeleteForeverIcon fontSize='small' sx={{ color: deleted ? grey[500] : red[500] }} />
                    <Typography>Delete</Typography>
                </MenuItem>
            </Menu>
            <ConfirmationModal
                open={confirmModalOpen}
                onClose={toggleConfirmModalOpen}
                message={`Delete "${file}"?`}
                onConfirm={() => {
                    toggleConfirmModalOpen();
                    toggleDeleted();
                    executeDelete().catch((e) => { });
                }}
            />
            <ProgressModal open={open} title='Downloading' progress={progress} />
        </>
    )
} 