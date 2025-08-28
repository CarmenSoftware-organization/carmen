# n8n Service Documentation

## Overview

n8n is a workflow automation tool that has been integrated into the Carmen project. It allows you to create automated workflows that can integrate with various services and APIs.

## Services

The n8n setup includes two Docker containers:

1. **n8n** - Main application (Port 5678)
2. **n8n-postgres** - PostgreSQL database for n8n data storage

## Access Information

- **URL**: http://localhost:5678
- **Default Username**: admin
- **Default Password**: your_secure_password_here (change in `.env.n8n`)

## Quick Start

### Using the Control Script

The easiest way to manage n8n is using the provided control script:

```bash
# Start n8n
./n8n-control.sh start

# Check status
./n8n-control.sh status

# View logs
./n8n-control.sh logs

# Stop n8n
./n8n-control.sh stop
```

### Manual Docker Compose Commands

```bash
# Start services
docker-compose -f docker-compose.n8n.yml --env-file .env.n8n up -d

# Stop services
docker-compose -f docker-compose.n8n.yml down

# View logs
docker-compose -f docker-compose.n8n.yml logs -f

# Check status
docker-compose -f docker-compose.n8n.yml ps
```

## Configuration

### Environment Variables

Configuration is managed through the `.env.n8n` file:

- `N8N_HOST` - Hostname for n8n (default: localhost)
- `N8N_PORT` - Port for n8n (default: 5678)
- `N8N_BASIC_AUTH_USER` - Username for basic authentication
- `N8N_BASIC_AUTH_PASSWORD` - Password for basic authentication
- Database configuration for PostgreSQL integration

### Security Considerations

1. **Change Default Credentials**: Update the credentials in `.env.n8n` before first use
2. **Basic Authentication**: Currently enabled by default
3. **Network Access**: Only accessible from localhost by default
4. **Docker Socket**: Mounted read-only for container management capabilities

## Data Persistence

- **Workflows**: Stored in `./n8n/workflows/` directory
- **Credentials**: Stored in `./n8n/credentials/` directory
- **Database Data**: Persisted in Docker volume `carmen_n8n_postgres_data`
- **Application Data**: Persisted in Docker volume `carmen_n8n_data`

## Integration with Carmen

n8n can be used to automate various tasks in the Carmen ERP system:

1. **Data Synchronization**: Sync data between different modules
2. **Notification Workflows**: Send alerts and notifications
3. **Report Generation**: Automated report generation and distribution
4. **External Integrations**: Connect with third-party services
5. **Business Process Automation**: Automate routine business processes

## Common Use Cases

### 1. Purchase Request Notifications
Create workflows to notify approvers when new purchase requests are submitted.

### 2. Inventory Alerts
Set up automated alerts when inventory levels fall below thresholds.

### 3. Vendor Communication
Automate communication with vendors for purchase orders and quotes.

### 4. Data Import/Export
Scheduled data imports from external systems or exports to accounting software.

### 5. Report Distribution
Automated generation and distribution of daily/weekly/monthly reports.

## Troubleshooting

### Service Won't Start
```bash
# Check if ports are in use
lsof -i :5678

# Check Docker status
docker ps -a | grep n8n

# View detailed logs
./n8n-control.sh logs
```

### Cannot Access Web Interface
1. Verify service is running: `./n8n-control.sh status`
2. Check firewall settings
3. Ensure port 5678 is available
4. Try accessing via http://127.0.0.1:5678

### Database Connection Issues
1. Check PostgreSQL container health
2. Verify database credentials in `.env.n8n`
3. Check database logs: `docker logs carmen_n8n_postgres`

### Performance Issues
1. Increase Docker resource limits
2. Monitor container resource usage: `docker stats`
3. Check workflow complexity and frequency

## Backup and Recovery

### Backup Workflows
Workflows are automatically saved to `./n8n/workflows/` directory and can be version controlled.

### Database Backup
```bash
# Create database backup
docker exec carmen_n8n_postgres pg_dump -U n8n n8n > n8n_backup.sql

# Restore database backup
docker exec -i carmen_n8n_postgres psql -U n8n n8n < n8n_backup.sql
```

### Full System Backup
```bash
# Backup all data
docker-compose -f docker-compose.n8n.yml down
tar -czf n8n_full_backup.tar.gz n8n/ .env.n8n
# Copy Docker volumes if needed
```

## Maintenance

### Updating n8n
```bash
# Stop services
./n8n-control.sh stop

# Pull latest image
docker pull n8nio/n8n:latest

# Start services
./n8n-control.sh start
```

### Cleaning Up
```bash
# Remove all n8n data (WARNING: destructive)
./n8n-control.sh clean
```

## Support

For n8n-specific documentation and support:
- [Official n8n Documentation](https://docs.n8n.io/)
- [n8n Community](https://community.n8n.io/)
- [n8n GitHub Repository](https://github.com/n8n-io/n8n)

For Carmen-specific integration questions, refer to the main project documentation.