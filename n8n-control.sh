#!/bin/bash
# n8n Control Script for Carmen Project

case "$1" in
    start)
        echo "Starting n8n service..."
        docker-compose -f docker-compose.n8n.yml --env-file .env.n8n up -d
        echo "n8n is starting up. Please wait a moment..."
        sleep 10
        echo "n8n should be available at: http://localhost:5678"
        echo "Default credentials: admin/your_secure_password_here"
        ;;
    stop)
        echo "Stopping n8n service..."
        docker-compose -f docker-compose.n8n.yml down
        ;;
    restart)
        echo "Restarting n8n service..."
        docker-compose -f docker-compose.n8n.yml down
        docker-compose -f docker-compose.n8n.yml --env-file .env.n8n up -d
        ;;
    logs)
        echo "Showing n8n logs..."
        docker-compose -f docker-compose.n8n.yml logs -f
        ;;
    status)
        echo "n8n service status:"
        docker-compose -f docker-compose.n8n.yml ps
        echo ""
        echo "Health check:"
        curl -s http://localhost:5678/healthz
        echo ""
        ;;
    clean)
        echo "Stopping and removing n8n containers, networks, and volumes..."
        echo "WARNING: This will delete all n8n data including workflows!"
        read -p "Are you sure? (y/N): " confirm
        if [[ $confirm == [yY] ]]; then
            docker-compose -f docker-compose.n8n.yml down -v
            docker volume rm carmen_n8n_data carmen_n8n_postgres_data 2>/dev/null || true
            echo "n8n completely removed."
        else
            echo "Operation cancelled."
        fi
        ;;
    *)
        echo "Usage: $0 {start|stop|restart|logs|status|clean}"
        echo ""
        echo "Commands:"
        echo "  start   - Start n8n service"
        echo "  stop    - Stop n8n service"
        echo "  restart - Restart n8n service"
        echo "  logs    - Show n8n logs"
        echo "  status  - Show service status and health"
        echo "  clean   - Remove all n8n data (WARNING: destructive)"
        echo ""
        echo "Access n8n at: http://localhost:5678"
        exit 1
        ;;
esac