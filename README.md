# AgentForge

**Open-source AI-native SaaS boilerplate for building production AI applications**

```
         ██████                        
        ██    ██     ██     █████    
       ██      ██   ██   ██   ██  ██  
      ██      ██████ ████████  ██      
      ██      ██   ██ ██   ██  ██      
        ██    ██   ██ ██   ██  ██    
         ██████    ██ ██   ██  ██    
                  _|_|_|_|              
                                         
       AI Agent Platform Made Easy
```

---

## What is AgentForge?

AgentForge is a **production-ready, open-source SaaS boilerplate** for building AI-powered applications with:

- 🔗 **MCP-Native** — Full Model Context Protocol client/server implementation
- 🧠 **Vector Database** — Built-in pgvector for semantic search
- 👥 **Multi-Tenant** — Database-level isolation with Row Level Security
- 🤖 **Multi-Agent** — Workspace collaboration with real-time sync
- 🔒 **Security First** — Hardened auth, RLS, audit logging
- 🐳 **Self-Hosted** — Docker all-in-one, deploy anywhere (Railway, AWS, GCP)

---

## Why AgentForge?

| Problem | Solution |
|---------|----------|
| Starting from scratch takes weeks | Zero-to-production in hours |
| Building MCP integration is hard | Full client/server implementation included |
| Multi-tenancy is error-prone | RLS policies enforced at database level |
| Need vector search? | pgvector built-in, no separate service |
| Want AI agents to collaborate? | Workspace system with real-time sync |
| Can't afford closed-source boilerplates | MIT licensed, fully open source |

---

## Quick Start

```bash
# Clone the repository
git clone https://github.com/your-username/agentforge.git
cd agentforge

# Start local development
docker-compose up

# Open http://localhost:3000
```

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 15, TypeScript, Tailwind CSS, shadcn/ui |
| Backend | Go 1.22+, Gin, gRPC |
| Database | Supabase PostgreSQL + pgvector |
| Cache | Redis |
| Auth | NextAuth.js |
| AI | Vercel AI SDK, MCP SDK |
| Real-time | Socket.IO |

---

## Features

### ✅ Foundation
- [x] Next.js 15 App Router
- [x] TypeScript + Tailwind
- [x] Docker Compose (all-in-one)
- [x] Monorepo structure

### ✅ Core Infrastructure  
- [x] Multi-tenant isolation with RLS
- [x] Authentication (email, OAuth, magic links)
- [x] RBAC (owner/admin/member/viewer)
- [x] API keys with rate limiting

### ✅ AI Features
- [x] MCP client/server
- [x] Built-in tools (file ops, web search, code execution)
- [x] Vector storage with pgvector
- [x] Streaming responses

### ✅ Multi-Agent
- [x] Workspace collaboration
- [x] Real-time agent sync
- [x] Memory strategies (conversation, summary, vector, hybrid)
- [x] Conflict resolution

### ✅ Production Ready
- [x] Billing integration (Lemon Squeezy)
- [x] Admin dashboard
- [x] Multi-cloud deployment configs
- [x] Monitoring (Sentry, PostHog)

---

## Deployment

### Railway
```bash
# Connect GitHub repo, deploy automatically
```

### AWS (ECS/Cloud Run)
```bash
# Use the included Terraform or CloudFormation templates
```

### GCP (Cloud Run)
```bash
# Use the included container deployment configs
```

### Self-Hosted (Docker)
```bash
docker-compose -f docker-compose.all-in-one.yml up
```

---

## Documentation

- [Getting Started](docs/getting-started.md)
- [Architecture](docs/architecture.md)
- [API Reference](docs/api-reference.md)
- [Deployment Guide](docs/deployment.md)
- [Security Guide](docs/security.md)

---

## Contributing

Contributions welcome! Please read our [contributing guide](CONTRIBUTING.md).

---

## License

**MIT** — See [LICENSE](LICENSE) for details.

---

## Community

- [GitHub Discussions](https://github.com/your-username/agentforge/discussions)
- [Discord Server](#) — Join the community

---

### Built with patterns from Claude Code from Source

AgentForge incorporates architectural patterns identified in the [Claude Code from Source](https://github.com/alejandrobalderas/claude-code-from-source) project — an educational analysis of production AI agent architecture.

---