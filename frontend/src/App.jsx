import React, { useState } from "react";
import axios from "axios";

import {
  Container,
  Typography,
  TextField,
  Button,
  Card,
  CardContent,
  Chip,
  Box,
  CircularProgress,
  Divider,
  Alert,
  LinearProgress,
  Stack,
  Avatar,
  IconButton,
  Paper,
} from "@mui/material";

import SearchIcon from "@mui/icons-material/Search";
import AddIcon from "@mui/icons-material/Add";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import SmartToyIcon from "@mui/icons-material/SmartToy";
import StorageIcon from "@mui/icons-material/Storage";
import PsychologyIcon from "@mui/icons-material/Psychology";

const API = "http://127.0.0.1:8000/api";

function App() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [content, setContent] = useState("");
  const [category, setCategory] = useState("General");

  const [adding, setAdding] = useState(false);
  const [message, setMessage] = useState("");

  const handleSearch = async () => {
    if (!query.trim()) return;

    setLoading(true);
    setError("");
    setResults([]);

    try {
      const response = await axios.post(`${API}/search`, {
        query,
        limit: 5,
      });

      setResults(response.data.results || []);
    } catch (err) {
      setError(
        err.response?.data?.detail || "Unable to search documents"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleAddDocument = async () => {
    if (!content.trim()) return;

    setAdding(true);
    setMessage("");

    try {
      await axios.post(`${API}/documents`, {
        content,
        category,
      });

      setMessage("Document successfully added to your knowledge base.");
      setContent("");
    } catch (err) {
      setMessage(
        err.response?.data?.detail || "Failed to add document"
      );
    } finally {
      setAdding(false);
    }
  };

  return (
    <Box className="app-shell">

      {/* Sidebar */}
      <Box className="sidebar">
        <Box className="brand">
          <Avatar className="brand-icon">
            <AutoAwesomeIcon />
          </Avatar>

          <Typography variant="h6" fontWeight="bold">
            VectorMind
          </Typography>
        </Box>

        <Typography className="sidebar-label">
          WORKSPACE
        </Typography>

        <Box className="sidebar-item active">
          <SearchIcon />
          <Typography>Semantic Search</Typography>
        </Box>

        <Box className="sidebar-item">
          <StorageIcon />
          <Typography>Knowledge Base</Typography>
        </Box>

        <Box className="sidebar-item">
          <PsychologyIcon />
          <Typography>AI Intelligence</Typography>
        </Box>

        <Box className="sidebar-bottom">
          <Divider sx={{ borderColor: "#30343b", mb: 1}} />

          <Box display="flex" alignItems="center" gap={1.5}>
            {/* <Avatar sx={{ height:"20px", bgcolor: "#2563eb" }}>AI</Avatar> */}
            <Box>
              <Typography sx={{ fontSize: "10px", fontWeight: 600 ,mb:1}}>
                AI Assistant
              </Typography>
              <Typography sx={{ fontSize: "8px" }}>
                Powered by PostgreSQL
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Main Content */}
      <Box className="main-content">

        {/* Header */}
        <Box className="topbar">
          <Box>
            <Typography variant="body2" color="text.secondary">
              WORKSPACE / SEMANTIC SEARCH
            </Typography>
          </Box>

          <Chip
            icon={<Box className="online-dot" />}
            label="System Online"
            className="status-chip"
          />
        </Box>

        <Container maxWidth="lg" className="dashboard">

          {/* Hero */}
          <Box className="hero-section">
            <Chip
              icon={<AutoAwesomeIcon />}
              label="AI POWERED KNOWLEDGE ENGINE"
              className="hero-chip"
            />

            <Typography variant="h3" className="hero-title">
              Your knowledge.
              <br />
              <span>Intelligently connected.</span>
            </Typography>

            <Typography className="hero-description">
              Search your knowledge base using natural language.
              Discover meaningful connections with AI-powered
              semantic vector search.
            </Typography>
          </Box>

          {/* Search Card */}
          <Card className="glass-card search-card">
            <CardContent>

              <Box className="section-heading">
                <Avatar className="section-icon">
                  <SmartToyIcon />
                </Avatar>

                <Box>
                  <Typography fontWeight={700}>
                    Ask your knowledge base
                  </Typography>

                  <Typography variant="caption" color="text.secondary">
                    AI semantic retrieval
                  </Typography>
                </Box>
              </Box>

              <TextField
                fullWidth
                multiline
                minRows={3}
                placeholder="Ask anything... e.g. Explain how vector databases work"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSearch();
                  }
                }}
                className="dark-input"
              />

              <Box className="search-footer">
                <Typography variant="caption" color="text.secondary">
                  <PsychologyIcon
                    sx={{ fontSize: 15, verticalAlign: "middle", mr: 0.5 }}
                  />
                  Context-aware semantic search
                </Typography>

                <Button
                  variant="contained"
                  startIcon={
                    loading ? (
                      <CircularProgress size={17} color="inherit" />
                    ) : (
                      <SearchIcon />
                    )
                  }
                  onClick={handleSearch}
                  disabled={loading || !query.trim()}
                  className="primary-button"
                >
                  {loading ? "Thinking..." : "Ask AI"}
                </Button>
              </Box>

            </CardContent>
          </Card>

          {/* Error */}
          {error && (
            <Alert severity="error" sx={{ mt: 3 }}>
              {error}
            </Alert>
          )}

          {/* Loading */}
          {loading && (
            <Box mt={3}>
              <Typography color="text.secondary" mb={1}>
                Searching your knowledge base...
              </Typography>
              <LinearProgress className="loading-bar" />
            </Box>
          )}

          {/* Results */}
          {!loading && results.length > 0 && (
            <Box className="results-section">

              <Box className="results-heading">
                <Typography variant="h6" fontWeight={700}>
                  Retrieved knowledge
                </Typography>

                <Chip
                  label={`${results.length} matches`}
                  className="result-count"
                />
              </Box>

              <Stack spacing={2}>
                {results.map((item) => (
                  <Card key={item.id} className="result-card">
                    <CardContent>

                      <Box className="result-top">
                        <Chip
                          label={item.category || "General"}
                          className="category-chip"
                        />

                        <Typography className="similarity">
                          {item.similarity}% match
                        </Typography>
                      </Box>

                      <Typography className="result-content">
                        {item.content}
                      </Typography>

                      <LinearProgress
                        variant="determinate"
                        value={Math.max(
                          0,
                          Math.min(100, item.similarity)
                        )}
                        className="similarity-bar"
                      />

                      <Typography
                        variant="caption"
                        color="text.secondary"
                      >
                        Reference ID: #{item.id}
                      </Typography>

                    </CardContent>
                  </Card>
                ))}
              </Stack>
            </Box>
          )}

          {!loading && results.length === 0 && query && !error && (
            <Alert severity="info" sx={{ mt: 3 }}>
              No matching documents found. Try a different question.
            </Alert>
          )}

          {/* Divider */}
          <Divider className="main-divider" />

          {/* Add Document */}
          <Box className="add-section">

            <Box className="section-heading">
              <Avatar className="section-icon green-icon">
                <AddIcon />
              </Avatar>

              <Box>
                <Typography fontWeight={700}>
                  Expand your knowledge base
                </Typography>

                <Typography variant="caption" color="text.secondary">
                  Add documents for AI-powered retrieval
                </Typography>
              </Box>
            </Box>

            <Card className="glass-card">
              <CardContent>

                <Typography className="field-label">
                  DOCUMENT CONTENT
                </Typography>

                <TextField
                  fullWidth
                  multiline
                  minRows={4}
                  placeholder="Paste your document or knowledge here..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="dark-input"
                />

                <Typography className="field-label" sx={{ mt: 3 }}>
                  CATEGORY
                </Typography>

                <TextField
                  fullWidth
                  placeholder="e.g. Technology, AI, Business"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="dark-input"
                />

                <Box className="add-footer">

                  <Typography variant="caption" color="text.secondary">
                    <StorageIcon
                      sx={{ fontSize: 15, verticalAlign: "middle", mr: 0.5 }}
                    />
                    Stored in PostgreSQL Vector Database
                  </Typography>

                  <Button
                    variant="contained"
                    color="success"
                    startIcon={
                      adding ? (
                        <CircularProgress size={17} color="inherit" />
                      ) : (
                        <AddIcon />
                      )
                    }
                    onClick={handleAddDocument}
                    disabled={adding || !content.trim()}
                    className="add-button"
                  >
                    {adding ? "Adding..." : "Add to Knowledge Base"}
                  </Button>

                </Box>

                {message && (
                  <Alert
                    severity={
                      message.includes("successfully") ? "success" : "error"
                    }
                    sx={{ mt: 3 }}
                  >
                    {message}
                  </Alert>
                )}

              </CardContent>
            </Card>
          </Box>

          {/* Footer */}
          <Box className="footer">
            <Typography variant="caption">
              VectorMind AI · Semantic Search Engine
            </Typography>
            <Typography variant="caption">
              Built with React · FastAPI · PostgreSQL · pgvector
            </Typography>
          </Box>

        </Container>
      </Box>
    </Box>
  );
}

export default App;