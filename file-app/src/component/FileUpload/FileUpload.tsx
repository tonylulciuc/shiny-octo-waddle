import { Box, Card, Modal, Typography } from "@mui/material";
import { useToggle } from "@uidotdev/usehooks";
import useAxios from "axios-hooks";
import { ChangeEvent, useState } from "react";
import { BorderLinearProgress } from "../AppBar/AppBar";

interface FileUploadProps {
    onClose: () => void;
}


export default function FileUpload(props: FileUploadProps) {
    const { onClose } = props;
    const [fileList, setFileList] = useState<FileList | null>(null);
    const files = fileList ? [...Array.from(fileList)] : [];
    const [open, toggle] = useToggle(false);
    const [percentCompleted, setPercentCompleted] = useState(0.0);

    const [, executeFileUpload] = useAxios({
        url: '/upload',
        method: 'POST',
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }, {
        manual: true,
      });

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        setFileList(e.target.files);
    };

    const handleUploadClick = () => {
        if (!fileList) {
        return;
        }

        // 👇 Create new FormData object and append files
        const data = new FormData();

        files?.forEach((file, i) => {
            data.append(`file-${i}`, file, file.name);
        });

        // 👇 Uploading the files using the fetch API to the server
        executeFileUpload({
            data,
            onUploadProgress: (progressEvent) => {
                setPercentCompleted(Math.round((progressEvent.loaded * 100) /(progressEvent?.total ?? 0)));
            }
        })
        .then(() => {
            toggle();
            setPercentCompleted(0);
            onClose();
        })
        .catch(() => {
            toggle();
            setPercentCompleted(0);
            onClose();
        });
    };

    return (
        <>
            <Modal open>
                <Box sx={{ display: 'flex', justifyContent: 'center', marginTop: '20%' }}>
                    <Card sx={{ padding: 8}}>
                        <input type="file" onChange={handleFileChange} multiple />
                    
                        <ul>
                            {files.map((file, i) => (
                            <li key={i}>
                                {file.name} - {file.type}
                            </li>
                            ))}
                        </ul>
                    
                        <button onClick={handleUploadClick}>Upload</button>
                    </Card>
                </Box>
            </Modal>
            <Modal open={open}>
                <Box sx={{ display: 'flex', justifyContent: 'center', marginTop: '20%' }}>
                    <Card sx={{ padding: 8}}>
                        <Typography variant="h6" component="h2">
                            Uploading
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
      );
}