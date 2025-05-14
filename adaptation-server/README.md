# Adaptation Server

## Docker Setup

This repository includes Docker configuration to run the Adaptation Server with PostgreSQL.

### Prerequisites

- Docker
- Docker Compose

### Running with Docker

1. Build and start the containers:

```bash
docker-compose up -d
```

2. The server will be available at http://localhost:8080

3. Swagger UI is available at http://localhost:8080/swagger

### Configuration

By default, the Docker setup uses the following configuration:

- PostgreSQL database:
  - Host: db
  - Port: 5432
  - Database: adaptation
  - Username: postgres
  - Password: postgres

- JWT Settings are configured through environment variables in docker-compose.yml

### Stopping the services

To stop the running containers:

```bash
docker-compose down
```

To stop and remove volumes:

```bash
docker-compose down -v
```

### Development

For development, you may want to use the following command instead:

```bash
docker-compose up --build
```

This will rebuild the containers before starting them, ensuring your latest code changes are included. 