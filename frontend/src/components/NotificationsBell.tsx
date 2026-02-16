import { useState, useEffect } from 'react';
import {
  IconButton,
  Badge,
  Menu,
  MenuItem,
  Typography,
  ListItemText,
  Button,
  Box,
  CircularProgress,
} from '@mui/material';
import { Notifications as NotificationsIcon } from '@mui/icons-material';
import api from '../services/api';

interface Notification {
  id: number;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
}

const NotificationsBell = () => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const open = Boolean(anchorEl);

  const fetchNotifications = async () => {
    try {
      const res = await api.get<Notification[]>('/notifications');
      setNotifications(res.data);
    } catch {
      setNotifications([]);
    }
  };

  useEffect(() => {
    if (open) {
      setLoading(true);
      fetchNotifications().finally(() => setLoading(false));
    }
  }, [open]);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const handleOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleMarkAsRead = async (id: number) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
    } catch {
      // ignore
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.put('/notifications/read-all');
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch {
      // ignore
    }
  };

  return (
    <>
      <IconButton color="inherit" onClick={handleOpen} aria-label="notifications">
        <Badge badgeContent={unreadCount} color="secondary">
          <NotificationsIcon />
        </Badge>
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        slotProps={{ paper: { sx: { maxHeight: 400, minWidth: 320 } } }}
      >
        <Box sx={{ px: 2, py: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="subtitle1">Notifications</Typography>
          {unreadCount > 0 && (
            <Button size="small" onClick={handleMarkAllRead}>
              Mark all read
            </Button>
          )}
        </Box>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
            <CircularProgress size={24} />
          </Box>
        ) : notifications.length === 0 ? (
          <MenuItem disabled>
            <ListItemText primary="No notifications" />
          </MenuItem>
        ) : (
          notifications.map((n) => (
            <MenuItem
              key={n.id}
              onClick={() => handleMarkAsRead(n.id)}
              sx={{ opacity: n.isRead ? 0.8 : 1 }}
            >
              <ListItemText
                primary={n.title}
                secondary={n.message}
                primaryTypographyProps={{ fontWeight: n.isRead ? 400 : 600 }}
              />
            </MenuItem>
          ))
        )}
      </Menu>
    </>
  );
};

export default NotificationsBell;
