import { Box, Button, ButtonGroup, Card, ListItem, Modal, Typography } from "@mui/material";
import { useToggle } from "@uidotdev/usehooks";
import useAxios from "axios-hooks";
import { ChangeEvent, useEffect, useRef, useState } from "react";
import { ListChildComponentProps } from "react-window";
import { ZebraFileList } from "../DirectoryTree/DirectoryTree";
import ProgressModal from "../ProgressModal/ProgressModal";

interface FileUploadProps {
    open: boolean;
    onClose: () => void;
}


function renderRow(props: ListChildComponentProps) {
    const { index, data, style } = props;

    return (
        <div className="row" style={style}>
            <ListItem key={index}>
                <Typography>{data[index].name} - {data[index].type}</Typography>
            </ListItem>
        </div>

    );
}

export default function FileUploadModal(props: FileUploadProps) {
    const { open, onClose } = props;
    const [fileList, setFileList] = useState<FileList | null>(null);
    const files = useRef(fileList ? [...Array.from(fileList)] : []);
    const [progressModalOpen, toggleProgressModalOpen] = useToggle(false);
    const progress = useRef<number>(0);

    const [, executeFileUpload] = useAxios({
        url: '/upload2',
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

    const uploadFile = (file: File) => {
        const result: { resolve?: any; reject?: any; } = {};
        const promise = new Promise<void>((resolve, reject) => {
            result.resolve = resolve;
            result.reject = reject;
        });
        const chunkSize = 1 * 1024 * 1024; // 1 MB
        const totalChunksForFile = Math.ceil(file.size / chunkSize);
        const chunkProgress = 100 / totalChunksForFile;
        const oneChunk = (100 / files.current.length) * (1 / totalChunksForFile);

        let chunkNumber = 0;
        let start = 0;
        let end = file.size > chunkSize ? chunkSize : file.size;

        const uploadNextChunk = async () => {
            if (end <= file.size) {
                const chunk = file.slice(start, end);
                const data = new FormData();

                data.append("file", chunk);
                data.append("chunkNumber", `${chunkNumber}`);
                data.append("totalChunks", `${totalChunksForFile}`);
                data.append("chunkOffset", `${chunkSize}`);
                data.append("originalName", file.name);
                data.append("originalSize", `${file.size}`);

                executeFileUpload({ data })
                    .then(() => {
                        if (chunkNumber >= totalChunksForFile) {
                            end = file.size + 1;
                            result.resolve();
                            return;
                        }

                        progress.current = progress.current + oneChunk;
                        chunkNumber++;
                        start = end;
                        end = start + chunkSize > file.size ? file.size : start + chunkSize;
                        uploadNextChunk();
                    })
                    .catch((e) => {
                        progress.current = progress.current + (100 / files.current.length) * ((totalChunksForFile - chunkProgress) / totalChunksForFile);
                        result.reject();
                    });
            }

        };

        uploadNextChunk();

        return promise;
    }

    const handleUploadClick = async () => {
        if (!fileList) {
            return;
        }

        toggleProgressModalOpen();

        for (const file of files.current) {
            await uploadFile(file);
        };


        toggleProgressModalOpen();
        progress.current = 0;
        setFileList(null);
        onClose();
    };

    useEffect(() => {
        files.current = fileList ? [...Array.from(fileList)] : [];
    }, [fileList]);

    return (
        <>
            <Modal open={open}>
                <Box sx={{ display: 'flex', justifyContent: 'center', marginTop: '20%' }}>
                    <Card elevation={9} sx={{ paddingTop: 1, width: 540 }}>
                        <Typography variant="h5">Upload Files</Typography>
                        <Card elevation={1} sx={{ marginTop: 1, height: 350 }}>
                            <input type="file" onChange={handleFileChange} multiple />
                            <ZebraFileList
                                itemData={files.current}
                                itemSize={46}
                                itemCount={files.current.length}
                                overscanCount={5}
                                height={330}
                                width={540}
                            >
                                {renderRow}
                            </ZebraFileList>
                        </Card>
                        <ButtonGroup fullWidth>
                            <Button
                                disabled={files.current.length === 0}
                                onClick={handleUploadClick}>
                                Upload
                            </Button>
                            <Button
                                onClick={() => {
                                    setFileList(null);
                                    onClose();
                                }}>
                                Cancel
                            </Button>
                        </ButtonGroup>
                    </Card>
                </Box>
            </Modal>
            <ProgressModal title="Uploading" open={progressModalOpen} progress={progress.current} />
        </>
    );
}