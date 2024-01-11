import { Box, CircularProgress, Paper, Typography } from "@mui/material";
import useAxios from "axios-hooks";
import { useCallback, useEffect, useMemo, useState } from "react";
import AutoSizer from "react-virtualized-auto-sizer";
import { FixedSizeList, ListChildComponentProps } from 'react-window';
import { useRecoilValue } from "recoil";
import { debounce } from "ts-debounce";
import { searchState, storageSpaceState } from "../AppBar/AppBar";
import FileListItem from "../FileListItem/FileListItem";
import { uploadingState } from "../FileUploadModal/FileUploadModal";


function renderRow(props: ListChildComponentProps) {
    const { index, data, style } = props;

    return (
        <div style={style}>
            <FileListItem
                key={`file-${index}`}
                file={data[index]}
            />
        </div>
    );
}


export default function DirectoryTree() {
    const [{ loading, error, data }, reload] = useAxios('/dir/all', { manual: true });
    const sortedData = useMemo(() => data?.sort((l: string, r: string) => (l > r ? -1 : 1)), [data]);
    const { used_space } = useRecoilValue(storageSpaceState);
    const search = useRecoilValue(searchState);
    const [filteredData, setFilteredData] = useState([]);
    const uploading = useRecoilValue(uploadingState);
    const applyFilter = useCallback(
        debounce((files, find: string) => {
            const f = files.filter((file: string) => file.toLocaleLowerCase().indexOf(find ?? '') > -1);
            setFilteredData(f);
        },
            300
        ),
        [setFilteredData]
    );

    useEffect(() => {
        if (!search) {
            setFilteredData(sortedData ?? []);
            return;
        }

        applyFilter(sortedData, search);
    }, [search, sortedData, applyFilter]);


    useEffect(() => {
        if (used_space === 0 || uploading) {
            return;
        }

        reload()
            .catch((e) => {});
    }, [used_space, reload, uploading]);

    if (loading) {
        return (
            <div style={{ marginTop: '20%' }}>
                <CircularProgress size="10rem" />
            </div>
        );
    }

    if (error) {
        return (<div>Failed to load content</div>);
    }

    return (
        <Paper style={{
            height: 'calc(100% - 64px)',
            overflowY: 'auto',
            
        }}>
            {filteredData.length == 0 && <Typography sx={{ paddingTop: 24 }} variant="h4">No files found</Typography>}
            {filteredData.length > 0 && (
                <Box
                    sx={{
                        height: '100%',
                        '.row:nth-of-type(odd)': {
                            backgroundColor: 'action.hover',
                        },
                    }}
                >
                    <AutoSizer>
                        {({ height, width }: any) => (
                            <FixedSizeList
                                key={`key-${search}-${filteredData.length}`} 
                                itemData={filteredData}
                                itemSize={85}
                                itemCount={filteredData.length}
                                overscanCount={5}
                                height={height}
                                width={width}
                            >
                                {renderRow}
                            </FixedSizeList>
                        )}
                    </AutoSizer>
                </Box>
            )}
        </Paper>
    )
}