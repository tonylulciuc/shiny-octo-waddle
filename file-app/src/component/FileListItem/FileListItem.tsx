import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import DownloadForOfflineIcon from '@mui/icons-material/DownloadForOffline';
import { IconButton, ListItem, Tooltip, Typography } from "@mui/material";
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
    const [confirmModalOpen, toggleConfirmModalOpen] = useToggle(false);
    const [progress, setProgress] = useState(0);
    const handleDownloadProgress = (progressEvent: AxiosProgressEvent) => {
        setProgress(Math.round((progressEvent.loaded * 100) /(progressEvent?.total ?? 0)));
    };
    const handleDownloadComplete = () => {
        toggle();
        setProgress(0);
    }
    
    return (
        <>
            <ListItem>
                <Tooltip title={file}>
                    <Typography noWrap overflow='hidden' textOverflow='ellipsis'>{file}</Typography>
                </Tooltip>
                <span style={{ marginLeft: 'auto' }} />
                <IconButton 
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
                        .catch(handleDownloadComplete);
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
            <ProgressModal open={open} title='Downloading' progress={progress} />
        </>
    )
} 