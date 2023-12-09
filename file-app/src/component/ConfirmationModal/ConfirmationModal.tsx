import { Box, Button, ButtonGroup, Card, Divider, Modal, Typography } from "@mui/material";

export interface ConfirmationModalProps {
    message: string;
    open: boolean;
    onConfirm: () => void;
    onClose: () => void;
}

export default function ConfirmationModal(props: ConfirmationModalProps) {
    const {
        message,
        open,
        onConfirm,
        onClose,
    } = props;

    return (
        <Modal open={open} onClose={() => onClose()}>
            <Box sx={{ display: 'flex', justifyContent: 'center', marginTop: '20%' }}>
                <Card sx={{ padding: 8}}>
                    <Typography variant="h5" component="h2">
                        Are you sure?
                    </Typography>
                    <Box sx={{ display: 'flex', marginTop: 4  }}>
                        <Typography>{message}</Typography>
                    </Box>
                    <ButtonGroup sx={{ marginTop: 4, marginLeft: 3 }}>
                        <Button variant="contained" onClick={onConfirm}>Yes</Button>
                        <span style={{ padding: 8 }} />
                        <Button onClick={onClose}>No</Button>
                    </ButtonGroup>
                </Card>
            </Box>
        </Modal>
    );
}