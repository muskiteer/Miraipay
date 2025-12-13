'use client';

import { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  Button,
  TextField,
  InputAdornment,
  CircularProgress,
  Alert,
} from '@mui/material';
import { Search, Wrench, DollarSign, User, CheckCircle, Clock } from 'lucide-react';
import api from '@/lib/api';
import { getStoredUser } from '@/lib/auth';

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

export default function ToolsPage() {
  const [tools, setTools] = useState<Tool[]>([]);
  const [filteredTools, setFilteredTools] = useState<Tool[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [paymentLoading, setPaymentLoading] = useState<number | null>(null);
  const [error, setError] = useState('');
  const user = getStoredUser();

  useEffect(() => {
    fetchTools();
  }, []);

  useEffect(() => {
    if (searchQuery) {
      const filtered = tools.filter(
        (tool) =>
          tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          tool.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredTools(filtered);
    } else {
      setFilteredTools(tools);
    }
  }, [searchQuery, tools]);

  const fetchTools = async () => {
    try {
      const response = await api.get('/api/tools/?approved_only=true');
      setTools(response.data);
      setFilteredTools(response.data);
    } catch (err) {
      console.error('Failed to fetch tools:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePayAndUse = async (toolId: number) => {
    setPaymentLoading(toolId);
    setError('');

    try {
      const response = await api.post(`/api/payments/pay/${toolId}`);
      alert(`Payment successful! Transaction: ${response.data.tx_hash}`);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Payment failed');
    } finally {
      setPaymentLoading(null);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Box mb={4}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Box display="flex" alignItems="center">
            <Wrench size={32} color="#667eea" />
            <Typography variant="h4" fontWeight="bold" sx={{ ml: 2 }}>
              Tool Marketplace
            </Typography>
          </Box>
          <Button
            variant="contained"
            href="/create-tool"
            sx={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #5568d3 0%, #6a3d8f 100%)',
              },
            }}
          >
            Create Tool
          </Button>
        </Box>

        <TextField
          fullWidth
          placeholder="Search tools by name or description..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search size={20} />
              </InputAdornment>
            ),
          }}
          sx={{ maxWidth: 600 }}
        />
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {filteredTools.length === 0 ? (
        <Card>
          <CardContent sx={{ py: 8, textAlign: 'center' }}>
            <Wrench size={64} color="#ccc" style={{ marginBottom: 16 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No tools found
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {searchQuery
                ? 'Try adjusting your search query'
                : 'Be the first to create a tool!'}
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={3}>
          {filteredTools.map((tool) => (
            <Grid item xs={12} md={6} lg={4} key={tool.id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box display="flex" justifyContent="space-between" alignItems="start" mb={2}>
                    <Typography variant="h6" fontWeight="bold">
                      {tool.name}
                    </Typography>
                    {tool.approved ? (
                      <Chip
                        icon={<CheckCircle size={14} />}
                        label="Approved"
                        color="success"
                        size="small"
                      />
                    ) : (
                      <Chip
                        icon={<Clock size={14} />}
                        label="Pending"
                        color="warning"
                        size="small"
                      />
                    )}
                  </Box>

                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2, minHeight: 60 }}>
                    {tool.description}
                  </Typography>

                  <Box sx={{ mb: 2 }}>
                    <Chip label={tool.api_method} size="small" sx={{ mr: 1 }} />
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{
                        display: 'inline-block',
                        fontFamily: 'monospace',
                        bgcolor: 'grey.100',
                        px: 1,
                        py: 0.5,
                        borderRadius: 1,
                      }}
                    >
                      {tool.api_url.length > 40
                        ? tool.api_url.substring(0, 40) + '...'
                        : tool.api_url}
                    </Typography>
                  </Box>

                  <Box display="flex" justifyContent="space-between" alignItems="center" mt={2}>
                    <Box display="flex" alignItems="center">
                      <DollarSign size={20} color="#10b981" />
                      <Typography variant="h6" fontWeight="bold" color="success.main">
                        {tool.price_mnee.toFixed(2)} MNEE
                      </Typography>
                    </Box>

                    {user && tool.owner_id !== user.id ? (
                      <Button
                        variant="contained"
                        size="small"
                        onClick={() => handlePayAndUse(tool.id)}
                        disabled={paymentLoading === tool.id}
                        sx={{
                          background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                          '&:hover': {
                            background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                          },
                        }}
                      >
                        {paymentLoading === tool.id ? (
                          <CircularProgress size={20} color="inherit" />
                        ) : (
                          'Pay & Use'
                        )}
                      </Button>
                    ) : (
                      <Chip
                        icon={<User size={14} />}
                        label="Your Tool"
                        size="small"
                        color="primary"
                      />
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
}
