'use client';

import { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Alert,
  Chip,
  Grid,
  Paper,
  CircularProgress,
} from '@mui/material';
import { Bot, Send, Zap, Code } from 'lucide-react';
import api from '@/lib/api';
import { getStoredUser } from '@/lib/auth';

interface Tool {
  name: string;
  description: string;
  tool_id: number;
  price_mnee: number;
}

interface ExecutionResult {
  success: boolean;
  tool_name: string;
  price_paid: number;
  tx_hash: string;
  result: any;
}

export default function AIAgentPage() {
  const [tools, setTools] = useState<Tool[]>([]);
  const [selectedTool, setSelectedTool] = useState<Tool | null>(null);
  const [parameters, setParameters] = useState('{}');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ExecutionResult | null>(null);
  const [error, setError] = useState('');
  const user = getStoredUser();

  useEffect(() => {
    fetchMCPTools();
  }, []);

  const fetchMCPTools = async () => {
    try {
      const response = await api.get('/mcp/tools');
      setTools(response.data.tools);
    } catch (err) {
      console.error('Failed to fetch MCP tools:', err);
    }
  };

  const handleExecute = async () => {
    if (!selectedTool || !user) return;

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const params = JSON.parse(parameters);
      const response = await api.post(
        `/mcp/execute/${selectedTool.tool_id}`,
        params,
        {
          headers: {
            'X-User-Email': user.email,
          },
        }
      );
      setResult(response.data);
    } catch (err: any) {
      if (err.message?.includes('JSON')) {
        setError('Invalid JSON format in parameters');
      } else {
        setError(err.response?.data?.detail || 'Execution failed');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Box mb={4}>
        <Box display="flex" alignItems="center" mb={2}>
          <Bot size={32} color="#667eea" />
          <Typography variant="h4" fontWeight="bold" sx={{ ml: 2 }}>
            AI Agent Interface
          </Typography>
        </Box>
        <Typography variant="body1" color="text.secondary">
          Test the MCP (Model Context Protocol) endpoint. This simulates how AI agents discover and execute tools.
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Tool Selection */}
        <Grid item xs={12} md={5}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Available Tools
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Select a tool to execute via MCP protocol
              </Typography>

              <Box sx={{ maxHeight: 500, overflow: 'auto' }}>
                {tools.map((tool) => (
                  <Paper
                    key={tool.tool_id}
                    sx={{
                      p: 2,
                      mb: 2,
                      cursor: 'pointer',
                      border: selectedTool?.tool_id === tool.tool_id ? 2 : 1,
                      borderColor:
                        selectedTool?.tool_id === tool.tool_id ? 'primary.main' : 'grey.300',
                      '&:hover': {
                        bgcolor: 'action.hover',
                      },
                    }}
                    onClick={() => setSelectedTool(tool)}
                  >
                    <Typography variant="subtitle1" fontWeight="bold">
                      {tool.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      {tool.description}
                    </Typography>
                    <Chip
                      label={`${tool.price_mnee} MNEE`}
                      size="small"
                      color="success"
                      sx={{ fontWeight: 600 }}
                    />
                  </Paper>
                ))}

                {tools.length === 0 && (
                  <Box textAlign="center" py={4}>
                    <Typography variant="body2" color="text.secondary">
                      No tools available
                    </Typography>
                  </Box>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Execution Panel */}
        <Grid item xs={12} md={7}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Execute Tool
              </Typography>

              {!selectedTool ? (
                <Box textAlign="center" py={8}>
                  <Zap size={64} color="#ccc" style={{ marginBottom: 16 }} />
                  <Typography variant="body1" color="text.secondary">
                    Select a tool from the list to get started
                  </Typography>
                </Box>
              ) : (
                <>
                  <Alert severity="info" sx={{ mb: 3 }}>
                    <Typography variant="body2" fontWeight="bold">
                      Selected: {selectedTool.name}
                    </Typography>
                    <Typography variant="body2">
                      Cost: {selectedTool.price_mnee} MNEE per execution
                    </Typography>
                  </Alert>

                  <Box mb={3}>
                    <Box display="flex" alignItems="center" mb={1}>
                      <Code size={20} />
                      <Typography variant="subtitle2" sx={{ ml: 1 }}>
                        Parameters (JSON)
                      </Typography>
                    </Box>
                    <TextField
                      fullWidth
                      multiline
                      rows={8}
                      value={parameters}
                      onChange={(e) => setParameters(e.target.value)}
                      placeholder='{\n  "param1": "value1",\n  "param2": "value2"\n}'
                      sx={{ fontFamily: 'monospace' }}
                    />
                  </Box>

                  {error && (
                    <Alert severity="error" sx={{ mb: 3 }}>
                      {error}
                    </Alert>
                  )}

                  <Button
                    fullWidth
                    variant="contained"
                    size="large"
                    startIcon={loading ? <CircularProgress size={20} /> : <Send />}
                    onClick={handleExecute}
                    disabled={loading || !user}
                    sx={{
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #5568d3 0%, #6a3d8f 100%)',
                      },
                      mb: 3,
                    }}
                  >
                    {loading ? 'Executing...' : 'Execute & Pay'}
                  </Button>

                  {result && (
                    <Box>
                      <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                        Execution Result
                      </Typography>
                      <Alert severity="success" sx={{ mb: 2 }}>
                        <Typography variant="body2">
                          <strong>Transaction:</strong> {result.tx_hash.slice(0, 20)}...
                        </Typography>
                        <Typography variant="body2">
                          <strong>Paid:</strong> {result.price_paid} MNEE
                        </Typography>
                      </Alert>

                      <Paper
                        sx={{
                          p: 2,
                          bgcolor: 'grey.900',
                          color: 'white',
                          fontFamily: 'monospace',
                          fontSize: 12,
                          overflow: 'auto',
                          maxHeight: 300,
                        }}
                      >
                        <pre>{JSON.stringify(result.result, null, 2)}</pre>
                      </Paper>
                    </Box>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* MCP Info */}
      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            About MCP Protocol
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <Typography variant="body2" color="text.secondary">
                <strong>Endpoint:</strong> <code>/mcp/tools</code>
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Lists all available tools for AI agents
              </Typography>
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography variant="body2" color="text.secondary">
                <strong>Execution:</strong> <code>/mcp/execute/{'{ tool_id }'}</code>
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Executes tool with automatic payment
              </Typography>
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography variant="body2" color="text.secondary">
                <strong>Authentication:</strong> <code>X-User-Email header</code>
              </Typography>
              <Typography variant="caption" color="text.secondary">
                User email for payment authorization
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Container>
  );
}
