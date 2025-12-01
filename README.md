# SZTEUniPress - Publication Review System

## Project Structure

```
szteunipress/
├── client/           # Angular frontend
└── server/           # Node.js backend
```

## Prerequisites

- Node.js (v14 or higher)
- MongoDB
- npm or yarn

## Installation

### Backend Setup

1. Navigate to the server directory:
```bash
cd server
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The backend server will run on `http://localhost:3000`

### Frontend Setup

1. Navigate to the client directory:
```bash
cd client/szteunipress
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
ng serve
```

The frontend application will be available at `http://localhost:4200`

## Populate database

1. Navigate to server directory:
```bash
cd server
```

2. Run the populating script
```bash
npm run seed
```

## Features

- Modern, responsive user interface built with Angular
- Publication submission system
- Peer review management
- Real-time progress tracking
- User authentication and authorization

## Development

The project uses:
- Angular 17 for the frontend
- Node.js with Express for the backend
- MongoDB for the database
- Bootstrap 5 for styling

## Run everything with Docker Compose

> Prerequisite: Docker Desktop (or Docker Engine) running locally.

1. From the repository root, build and start all services:
   ```bash
   docker compose up -d
   ```
   This will start:
   - `mongo` on the internal Docker network
   - `server` on `http://localhost:3000`
   - `client` (Angular dev server) on `http://localhost:4200`
   - `nginx` reverse proxy exposing the app on `http://localhost:8080`

2. Smoke-test the stack:
   ```bash
   curl http://localhost:3000/health
   # Expected: {"status":"ok"}
   ```
   For the combined experience, hit the nginx entrypoint:
   ```bash
   curl http://localhost:8080/nginx-health
   # Expected: ok
   ```
   Then open `http://localhost:8080` in a browser and walk through the app (login, submit paper, etc.). Nginx routes `/` to the Angular dev server and `/api/*` to the Node backend. Ports `3000`/`4200` remain exposed if you still want to access the services directly.

3. Stop the stack when you are done:
   ```bash
   docker compose down
   ```

> If ports `3000` or `4200` are already bound on the host, stop any previously running local Node/Angular servers before running `docker compose up -d`.

## Jenkins CI/CD (local)

1. Start Jenkins:
   ```bash
   docker compose up -d jenkins
   ```
   - UI: http://localhost:8081/jenkins
   - First-time setup: grab the admin password via `docker compose logs -f jenkins | grep -m1 "Please use the following password"`

2. In Jenkins:
   - Install the suggested plugins.
   - Create a new **Pipeline** job pointing at this repository.
   - Choose “Pipeline script from SCM” and keep `Jenkinsfile` in the repo root.

3. What the pipeline does:
   - Installs and builds the Angular client and Node server.
   - Builds Docker images for `client` and `server`.
   - Runs `docker compose up -d mongo server client nginx` to deploy the stack locally (same compose file).
   - Executes `scripts/smoke.sh` from inside Jenkins; failures mark the stage **UNSTABLE** but do **not** block deployment.

4. Trigger a build (manually or via webhook) and watch the stages complete. You can stop Jenkins anytime with `docker compose down jenkins`.

## Monitoring with Prometheus & Grafana

The stack includes Prometheus for metrics collection and Grafana for visualization.

### Services

1. **Prometheus** (`http://localhost:9090`):
   - Scrapes metrics from cAdvisor (container metrics) and node-exporter (host metrics)
   - Stores time-series data for querying and alerting

2. **cAdvisor** (`http://localhost:8082`):
   - Exposes container-level metrics (CPU, memory, network, filesystem) for all Docker containers

3. **node-exporter** (`http://localhost:9100`):
   - Exposes host-level metrics (CPU, memory, disk, network) from the Docker host

4. **Grafana** (`http://localhost:3001`):
   - Default credentials: `admin` / `admin`
   - Pre-configured with Prometheus as the default data source
   - Create dashboards to visualize container and host metrics

### Quick Start

1. Start monitoring services:
   ```bash
   docker compose up -d prometheus cadvisor node-exporter grafana
   ```

2. Verify Prometheus is scraping targets:
   - Visit `http://localhost:9090/targets`
   - All targets (prometheus, cadvisor, node-exporter) should show as **UP**

3. Access Grafana:
   - Visit `http://localhost:3001`
   - Login with `admin` / `admin`
   - Go to **Configuration → Data Sources** to verify Prometheus is connected
   
4. Import a pre-built dashboard (recommended for simplicity):
   - Click **Dashboards** → **Import**
   - Enter dashboard ID: **179** (Docker Container & Host Metrics)
   - Click **Load**
   - Select **Prometheus** as the data source
   - Click **Import**
   
   This dashboard shows:
   - Container CPU, memory, and network usage for all your services
   - Host-level metrics (CPU, memory, disk)
   - Simple, clean layout perfect for monitoring your Docker stack

5. Example Prometheus queries (in Prometheus UI at `http://localhost:9090`):
   - `up` - Check which targets are alive
   - `container_memory_usage_bytes{name="szteunipress-server"}` - Memory usage of the server container
   - `rate(container_cpu_usage_seconds_total[5m])` - CPU usage rate across containers
   - `node_memory_MemAvailable_bytes` - Available host memory

### Testing

Generate some load on your app (browse `http://localhost:8080`, submit papers, etc.) and watch metrics update in real-time in Grafana dashboards.

## Centralized Logging with Graylog

Graylog collects and centralizes logs from your backend server and nginx reverse proxy.

### Services

1. **Graylog** (`http://localhost:9000`):
   - Web UI for searching and analyzing logs
   - Default credentials: `admin` / `admin`
   - Receives logs via GELF UDP on port `12201`

2. **OpenSearch**:
   - Stores and indexes log data for fast searching
   - Runs internally (not exposed to host)

3. **Graylog MongoDB**:
   - Stores Graylog metadata (separate from your app's MongoDB)
   - Runs internally (not exposed to host)

### Quick Start

1. Start Graylog stack:
   ```bash
   docker compose up -d graylog-mongo opensearch graylog
   ```

2. Restart server and nginx to enable GELF logging:
   ```bash
   docker compose restart server nginx
   ```

3. Access Graylog (first-time setup):
   - Visit `http://localhost:9000`
   - Wait 1-2 minutes for services to fully initialize
   - **First login**: Graylog generates a random password for initial setup
   - Check the password in logs: `docker compose logs graylog | grep "password"`
   - Or look for a line like: `Initial configuration is accessible... with username 'admin' and password 'XXXXX'`
   - Complete the preflight setup wizard
   - After setup, you can change the password in **System → Users** if desired

4. View logs:
   - Go to **Search** in the top menu
   - You should see logs from `server` and `nginx` containers
   - Filter by `tag:server` or `tag:nginx` to see specific service logs

### Testing

1. Generate some activity:
   - Browse `http://localhost:8080`
   - Try logging in, submitting a paper, etc.
   - Make some API calls that might generate errors

2. In Graylog:
   - Search for logs: `tag:server` or `tag:nginx`
   - Look for HTTP requests, errors, and application logs
   - Use the search bar to filter by message content, status codes, etc.

### Log Sources

- **Server logs**: All Node.js/Express application logs, API requests, errors
- **Nginx logs**: Access logs, error logs, proxy requests

> Note: Logs are sent via GELF UDP, so they may take a few seconds to appear in Graylog after container restart.