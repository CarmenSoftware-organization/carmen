#!/bin/bash

echo "🐘 Setting up PostgreSQL MCP Server for Carmen"

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker first."
    exit 1
fi

# Pull the latest postgres-mcp image
echo "📦 Pulling PostgreSQL MCP image..."
docker pull crystaldba/postgres-mcp

# Start PostgreSQL database
echo "🚀 Starting PostgreSQL database..."
docker-compose -f docker-compose.postgres.yml up postgres -d

# Wait for PostgreSQL to be ready
echo "⏳ Waiting for PostgreSQL to be ready..."
sleep 10

# Check if PostgreSQL is healthy
if docker-compose -f docker-compose.postgres.yml ps postgres | grep -q "healthy"; then
    echo "✅ PostgreSQL is ready!"
else
    echo "❌ PostgreSQL failed to start properly. Check logs with:"
    echo "   docker-compose -f docker-compose.postgres.yml logs postgres"
    exit 1
fi

echo ""
echo "🎉 PostgreSQL MCP setup complete!"
echo ""
echo "📋 Connection details:"
echo "   Host: localhost"
echo "   Port: 5434"
echo "   Database: carmen"
echo "   Username: carmen_user"
echo "   Password: carmen_password"
echo ""
echo "🔧 To use the MCP server, restart Claude Code to load the new configuration."
echo ""
echo "📊 Useful commands:"
echo "   View logs:     docker-compose -f docker-compose.postgres.yml logs postgres"
echo "   Stop services: docker-compose -f docker-compose.postgres.yml down"
echo "   Connect to DB: docker exec -it carmen-postgres psql -U carmen_user -d carmen"
echo "   Connect via host: psql -h localhost -p 5434 -U carmen_user -d carmen"
echo ""