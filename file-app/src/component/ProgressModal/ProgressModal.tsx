import { Box, Card, Modal, Typography } from "@mui/material";
import { BorderLinearProgress } from "../AppBar/AppBar";

export interface ProgressModalProps {
    title: string;
    open: boolean;
    progress: number;
    onClose?: () => void;
}

export default function ProgressModal(props: ProgressModalProps) {
    const {
        title,
        open,
        progress,
        onClose,
    } = props;


    return (
        <Modal open={open} onClose={() => onClose?.()}>
            <Box sx={{ display: 'flex', justifyContent: 'center', marginTop: '20%' }}>
                <Card sx={{ padding: 8}}>
                    <Typography variant="h6" component="h2">
                        {title}
                    </Typography>
                    <Box sx={{ display: 'flex' }}>
                        <BorderLinearProgress  variant="determinate" value={progress} />
                        <span style={{ width: 8 }} />
                        <Typography>{progress.toFixed(2)}%</Typography>
                    </Box>
                </Card>
            </Box>
        </Modal>
    );
}