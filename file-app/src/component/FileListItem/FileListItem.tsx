import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import DownloadForOfflineIcon from '@mui/icons-material/DownloadForOffline';
import { Checkbox, IconButton, ListItem, Tooltip, Typography } from "@mui/material";
import { useToggle } from '@uidotdev/usehooks';
import useAxios from 'axios-hooks';
import { useState } from 'react';
import ProgressModal from '../ProgressModal/ProgressModal';
import { green, grey, red } from '@mui/material/colors';
import ConfirmationModal from '../ConfirmationModal/ConfirmationModal';



  
export interface FileListItemProps {
    file: string;
}

export default function FileListItem({ file }: FileListItemProps) {
    const [, executeDownload] = useAxios({
        url: `/file/${file}`,
        method: 'GET'
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
    const [percentCompleted, setPercentCompleted] = useState(0.0);
    const [deleted, toggleDeleted] = useToggle(false);
    const [confirmModalOpen, toggleConfirmModalOpen] = useToggle(false);
    
    return (
        <>
            <ListItem>
                <Tooltip title={file}>
                    <Typography noWrap overflow='hidden' textOverflow='ellipsis'>{file}</Typography>
                </Tooltip>
                <span style={{ marginLeft: 'auto' }} />
                <IconButton 
                    disabled={deleted}
                    onClick={() => {
                    toggle();
                    executeDownload({
                        onDownloadProgress: (progressEvent) => {
                            setPercentCompleted(Math.round((progressEvent.loaded * 100) /(progressEvent?.total ?? 0)));
                        }
                    })
                        .then((response) => {
                            toggle();
                            setPercentCompleted(0);
                            const url = window.URL.createObjectURL(new Blob([response.data]));
                            const link = document.createElement('a');
                            const data = file.split('/');
                            const fileName = data[data.length - 1];

                            link.href = url;
                            link.setAttribute('download', fileName);
                            document.body.appendChild(link);
                            link.click();
                        })
                        .catch(() => {
                            toggle();
                            setPercentCompleted(0);
                        });
                }}>
                    <DownloadForOfflineIcon  />
                </IconButton>
                <IconButton 
                    disabled={deleted}
                    onClick={() => toggleConfirmModalOpen()}>
                    <DeleteForeverIcon 
                        sx={{ color: deleted ? grey[500] : red[500] }}
                    />
                </IconButton>
            </ListItem>
            <ConfirmationModal 
                open={confirmModalOpen} 
                onClose={toggleConfirmModalOpen}
                message={`Delete "${file}"?`}
                onConfirm={() => {
                    toggleConfirmModalOpen();
                    toggleDeleted();
                    executeDelete().catch((e) => {});
                }}
                />
            <ProgressModal open={open} title='Downloading' progress={percentCompleted} />
        </>
    )
} 