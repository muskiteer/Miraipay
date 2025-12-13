'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Container,
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  MenuItem,
  Grid,
  Chip,
} from '@mui/material';
import { Wrench, Plus, Code } from 'lucide-react';
import api from '@/lib/api';

const HTTP_METHODS = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'];

export default function CreateToolPage() {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    api_url: '',
    api_method: 'GET',
    api_headers: '',
    api_body_template: '',
    price_mnee: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setLoading(true);

    try {
      // Validate JSON fields
      if (formData.api_headers) {
        JSON.parse(formData.api_headers);
      }
      if (formData.api_body_template) {
        JSON.parse(formData.api_body_template);
      }

      await api.post('/api/tools/', {
        ...formData,
        price_mnee: parseFloat(formData.price_mnee),
      });

      setSuccess(true);
      setTimeout(() => {
        router.push('/tools');
      }, 2000);
    } catch (err: any) {
      if (err.message?.includes('JSON')) {
        setError('Invalid JSON format in headers or body template');
      } else {
        setError(err.response?.data?.detail || 'Failed to create tool. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box mb={4}>
        <Box display="flex" alignItems="center" mb={2}>
          <Wrench size={32} color="#667eea" />
          <Typography variant="h4" fontWeight="bold" sx={{ ml: 2 }}>
            Create New Tool
          </Typography>
        </Box>
        <Typography variant="body1" color="text.secondary">
          Upload your API tool to the marketplace. Once approved by admin, it will be available for AI agents to use.
        </Typography>
      </Box>

      <Card>
        <CardContent sx={{ p: 4 }}>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              {/* Basic Information */}
              <Grid item xs={12}>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  Basic Information
                </Typography>
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Tool Name"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  required
                  placeholder="e.g., Weather API"
                  helperText="A short, descriptive name for your tool"
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Price (MNEE)"
                  type="number"
                  value={formData.price_mnee}
                  onChange={(e) => handleChange('price_mnee', e.target.value)}
                  required
                  inputProps={{ min: 0, step: 0.01 }}
                  placeholder="0.50"
                  helperText="Price per API call in MNEE stablecoin"
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="Description"
                  value={formData.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  required
                  placeholder="Describe what your API does and what data it returns"
                  helperText="Clear description helps AI agents understand when to use your tool"
                />
              </Grid>

              {/* API Configuration */}
              <Grid item xs={12}>
                <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ mt: 2 }}>
                  API Configuration
                </Typography>
              </Grid>

              <Grid item xs={12} md={8}>
                <TextField
                  fullWidth
                  label="API Endpoint URL"
                  value={formData.api_url}
                  onChange={(e) => handleChange('api_url', e.target.value)}
                  required
                  placeholder="https://api.example.com/endpoint"
                  helperText="Full URL of your API endpoint"
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  select
                  label="HTTP Method"
                  value={formData.api_method}
                  onChange={(e) => handleChange('api_method', e.target.value)}
                >
                  {HTTP_METHODS.map((method) => (
                    <MenuItem key={method} value={method}>
                      {method}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              <Grid item xs={12}>
                <Box display="flex" alignItems="center" mb={1}>
                  <Code size={20} />
                  <Typography variant="subtitle2" sx={{ ml: 1 }}>
                    Headers (Optional)
                  </Typography>
                  <Chip label="JSON" size="small" sx={{ ml: 1 }} />
                </Box>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  value={formData.api_headers}
                  onChange={(e) => handleChange('api_headers', e.target.value)}
                  placeholder='{"Authorization": "Bearer token", "Content-Type": "application/json"}'
                  helperText="JSON object with HTTP headers (optional)"
                  sx={{ fontFamily: 'monospace' }}
                />
              </Grid>

              <Grid item xs={12}>
                <Box display="flex" alignItems="center" mb={1}>
                  <Code size={20} />
                  <Typography variant="subtitle2" sx={{ ml: 1 }}>
                    Request Body Template (Optional)
                  </Typography>
                  <Chip label="JSON" size="small" sx={{ ml: 1 }} />
                </Box>
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  value={formData.api_body_template}
                  onChange={(e) => handleChange('api_body_template', e.target.value)}
                  placeholder='{"query": "value", "param": "value"}'
                  helperText="JSON template for POST/PUT requests. AI agents can merge parameters into this template."
                  sx={{ fontFamily: 'monospace' }}
                />
              </Grid>

              {/* Security Notice */}
              <Grid item xs={12}>
                <Alert severity="info" sx={{ mt: 2 }}>
                  <Typography variant="body2" fontWeight="bold" gutterBottom>
                    Security Notice
                  </Typography>
                  <Typography variant="body2">
                    • Your API metadata will be hashed and verified on every use
                    <br />
                    • Tool requires admin approval before going live
                    <br />• Do not include sensitive credentials in headers (use environment variables on your API side)
                  </Typography>
                </Alert>
              </Grid>

              {error && (
                <Grid item xs={12}>
                  <Alert severity="error">{error}</Alert>
                </Grid>
              )}

              {success && (
                <Grid item xs={12}>
                  <Alert severity="success">
                    Tool created successfully! Redirecting to tools page...
                  </Alert>
                </Grid>
              )}

              <Grid item xs={12}>
                <Box display="flex" gap={2} justifyContent="flex-end">
                  <Button variant="outlined" onClick={() => router.push('/tools')} disabled={loading}>
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    startIcon={<Plus />}
                    disabled={loading}
                    sx={{
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #5568d3 0%, #6a3d8f 100%)',
                      },
                    }}
                  >
                    {loading ? 'Creating...' : 'Create Tool'}
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </form>
        </CardContent>
      </Card>
    </Container>
  );
}
