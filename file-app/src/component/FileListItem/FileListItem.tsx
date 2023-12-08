import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import DownloadForOfflineIcon from '@mui/icons-material/DownloadForOffline';
import { Box, Card, IconButton, LinearProgress, ListItem, Modal, Tooltip, Typography } from "@mui/material";
import { useToggle } from '@uidotdev/usehooks';
import useAxios from 'axios-hooks';
import { useState } from 'react';
import { BorderLinearProgress } from '../AppBar/AppBar';




  
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

    return (
        <>
            <ListItem>
                <Tooltip title={file}>
                    <Typography noWrap overflow='hidden' textOverflow='ellipsis'>{file}</Typography>
                </Tooltip>
                <span style={{ marginLeft: 'auto' }} />
                <IconButton onClick={() => {
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
                    <DownloadForOfflineIcon />
                </IconButton>
                <IconButton onClick={() => {
                    executeDelete().catch((e) => {});
                }}>
                    <DeleteForeverIcon />
                </IconButton>
            </ListItem>
            <Modal open={open}>
                <Box sx={{ display: 'flex', justifyContent: 'center', marginTop: '20%' }}>
                    <Card sx={{ padding: 8}}>
                        <Typography variant="h6" component="h2">
                            Downloading
                        </Typography>
                        <Box sx={{ display: 'flex' }}>
                            <BorderLinearProgress  variant="determinate" value={percentCompleted} />
                            <span style={{ width: 8 }} />
                            <Typography>{percentCompleted}%</Typography>
                        </Box>
                    </Card>
                </Box>
            </Modal>
        </>
    )
} 