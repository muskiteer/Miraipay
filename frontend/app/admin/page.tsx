'use client';

import { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Chip,
  Alert,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from '@mui/material';
import { Shield, CheckCircle, XCircle, Clock, Users } from 'lucide-react';
import api from '@/lib/api';
import { getStoredUser } from '@/lib/auth';
import { useRouter } from 'next/navigation';

interface Tool {
  id: number;
  name: string;
  description: string;
  api_url: string;
  api_method: string;
  price_mnee: number;
  owner_id: number;
  approved: boolean;
  active: boolean;
  created_at: string;
}

interface User {
  id: number;
  email: string;
  public_key: string;
  is_admin: boolean;
  created_at: string;
}

export default function AdminPage() {
  const [pendingTools, setPendingTools] = useState<Tool[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [error, setError] = useState('');
  const user = getStoredUser();
  const router = useRouter();

  useEffect(() => {
    if (!user?.is_admin) {
      router.push('/dashboard');
      return;
    }
    fetchAdminData();
  }, [user, router]);

  const fetchAdminData = async () => {
    try {
      const [toolsRes, usersRes] = await Promise.all([
        api.get('/api/admin/pending-tools'),
        api.get('/api/admin/users'),
      ]);
      setPendingTools(toolsRes.data);
      setUsers(usersRes.data);
    } catch (err) {
      console.error('Failed to fetch admin data:', err);
      setError('Failed to load admin data');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (toolId: number) => {
    setActionLoading(toolId);
    setError('');

    try {
      await api.post(`/api/admin/approve-tool/${toolId}`);
      setPendingTools((prev) => prev.filter((tool) => tool.id !== toolId));
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to approve tool');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (toolId: number) => {
    setActionLoading(toolId);
    setError('');

    try {
      await api.post(`/api/admin/reject-tool/${toolId}`);
      setPendingTools((prev) => prev.filter((tool) => tool.id !== toolId));
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to reject tool');
    } finally {
      setActionLoading(null);
    }
  };

  const handleMakeAdmin = async (userId: number) => {
    setActionLoading(userId);
    setError('');

    try {
      await api.post(`/api/admin/make-admin/${userId}`);
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, is_admin: true } : u))
      );
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to make user admin');
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  if (!user?.is_admin) {
    return null;
  }

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Box mb={4}>
        <Box display="flex" alignItems="center" mb={2}>
          <Shield size={32} color="#667eea" />
          <Typography variant="h4" fontWeight="bold" sx={{ ml: 2 }}>
            Admin Panel
          </Typography>
        </Box>
        <Typography variant="body1" color="text.secondary">
          Manage tool approvals and user permissions
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {/* Statistics */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={1}>
                <Clock size={20} color="#f59e0b" />
                <Typography variant="h6" sx={{ ml: 1 }}>
                  Pending
                </Typography>
              </Box>
              <Typography variant="h4" fontWeight="bold">
                {pendingTools.length}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Tools awaiting approval
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={1}>
                <Users size={20} color="#667eea" />
                <Typography variant="h6" sx={{ ml: 1 }}>
                  Users
                </Typography>
              </Box>
              <Typography variant="h4" fontWeight="bold">
                {users.length}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Total registered users
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={1}>
                <Shield size={20} color="#10b981" />
                <Typography variant="h6" sx={{ ml: 1 }}>
                  Admins
                </Typography>
              </Box>
              <Typography variant="h4" fontWeight="bold">
                {users.filter((u) => u.is_admin).length}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Admin users
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={1}>
                <CheckCircle size={20} color="#10b981" />
                <Typography variant="h6" sx={{ ml: 1 }}>
                  Status
                </Typography>
              </Box>
              <Typography variant="h4" fontWeight="bold" color="success.main">
                Active
              </Typography>
              <Typography variant="caption" color="text.secondary">
                System operational
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Pending Tools */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            Pending Tool Approvals
          </Typography>

          {pendingTools.length === 0 ? (
            <Box textAlign="center" py={4}>
              <CheckCircle size={48} color="#10b981" style={{ marginBottom: 16 }} />
              <Typography variant="body1" color="text.secondary">
                No pending approvals
              </Typography>
            </Box>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Tool Name</TableCell>
                    <TableCell>Description</TableCell>
                    <TableCell>API</TableCell>
                    <TableCell>Price</TableCell>
                    <TableCell>Created</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {pendingTools.map((tool) => (
                    <TableRow key={tool.id}>
                      <TableCell>
                        <Typography fontWeight="bold">{tool.name}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ maxWidth: 300 }}>
                          {tool.description}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip label={tool.api_method} size="small" sx={{ mr: 1 }} />
                        <Typography variant="caption" sx={{ fontFamily: 'monospace' }}>
                          {tool.api_url.substring(0, 30)}...
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography fontWeight="bold" color="success.main">
                          {tool.price_mnee} MNEE
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="caption">
                          {new Date(tool.created_at).toLocaleDateString()}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Box display="flex" gap={1} justifyContent="flex-end">
                          <Button
                            size="small"
                            variant="contained"
                            color="success"
                            startIcon={<CheckCircle size={16} />}
                            onClick={() => handleApprove(tool.id)}
                            disabled={actionLoading === tool.id}
                          >
                            Approve
                          </Button>
                          <Button
                            size="small"
                            variant="outlined"
                            color="error"
                            startIcon={<XCircle size={16} />}
                            onClick={() => handleReject(tool.id)}
                            disabled={actionLoading === tool.id}
                          >
                            Reject
                          </Button>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      {/* User Management */}
      <Card>
        <CardContent>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            User Management
          </Typography>

          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Email</TableCell>
                  <TableCell>Wallet Address</TableCell>
                  <TableCell>Role</TableCell>
                  <TableCell>Registered</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.map((usr) => (
                  <TableRow key={usr.id}>
                    <TableCell>
                      <Typography fontWeight="bold">{usr.email}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                        {usr.public_key.slice(0, 15)}...
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {usr.is_admin ? (
                        <Chip label="Admin" color="primary" size="small" />
                      ) : (
                        <Chip label="User" size="small" />
                      )}
                    </TableCell>
                    <TableCell>
                      <Typography variant="caption">
                        {new Date(usr.created_at).toLocaleDateString()}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      {!usr.is_admin && (
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => handleMakeAdmin(usr.id)}
                          disabled={actionLoading === usr.id}
                        >
                          Make Admin
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </Container>
  );
}
