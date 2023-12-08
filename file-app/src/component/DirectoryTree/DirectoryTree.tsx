import { CircularProgress, List, Paper, Typography, styled } from "@mui/material";
import useAxios from "axios-hooks"
import FileListItem from "../FileListItem/FileListItem";
import { FixedSizeList, ListChildComponentProps } from 'react-window';
import AutoSizer from "react-virtualized-auto-sizer";
import { useRecoilValue } from "recoil";
import { searchState, storageSpaceState } from "../AppBar/AppBar";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { debounce } from "ts-debounce";


const FileList = styled(FixedSizeList)(({ theme }: any) => ({
  '.row': {
    '&:nth-of-type(odd)': {
      backgroundColor: theme.palette.action.hover,
    },
  },
}));

function renderRow(props: ListChildComponentProps) {
    const { index, data, style } = props;
  
    return (
        <div className="row" style={style}>
            <FileListItem key={`file-${index}`} file={data[index]} />
        </div>
        
    );
  }
  

export default function DirectoryTree() {
    const [{ loading, error, data }, reload] = useAxios('/dir/all', { manual: true });
    const { used_space } = useRecoilValue(storageSpaceState);
    const search = useRecoilValue(searchState);
    const [filteredData, setFilteredData] = useState([]);
    const applyFilter = useCallback(
        debounce((files, find: string) => setFilteredData(files.filter((file: string) => file.toLocaleLowerCase().includes(find ?? ''))), 300), 
        [setFilteredData]
    );
    
    useEffect(() => {
        if (!search) {
            setFilteredData(data ?? []);
            return;
        }

        applyFilter(data, search);
    }, [search, data, applyFilter]);


    useEffect(() => {
        if (used_space === 0) {
            return;
        }
        
        reload()
            .catch();
    }, [used_space, reload]);

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
                <AutoSizer>
                    {({ height, width }: any) => (
                        <FileList
                        itemData={filteredData}
                        itemSize={46}
                        itemCount={filteredData.length}
                        overscanCount={5}
                        height={height}
                        
                        width={width}
                        >
                            {renderRow}
                        </FileList>
                    )}
                </AutoSizer>
            )}
        </Paper>
    )
}