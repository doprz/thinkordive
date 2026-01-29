# thinkordive

A full-stack stock trading simulation platform where users can buy and sell stocks in a realistic market environment.

## Features

- **Customer Portal**: Buy/sell stocks, manage portfolio, and track transactions
- **Admin Dashboard**: Create stocks, manage market hours, and manage users
- **Real-time Price Engine**: Dynamic stock price fluctuations
- **Market Simulation**: Simulated market hours and holidays
- **User Authentication**: Secure login and registration

## Tech Stack

- **Frontend**: Tanstack Start, React, TypeScript, Tailwind CSS, Shadcn w/ Base UI, Bun, and SSR support
- **Backend**: Hono, Drizzle ORM, Better Auth, and Bun
- **Database**: PostgreSQL
- **DevOps & Tooling**: Bun, Turborepo, Docker/Podman, Docker Compose, Process Compose, Biome, Nix, and EditorConfig
- **Deployment**: TBD

## Project Structure

This is a Turborepo monorepo with the following structure:

```
thinkordive
├── apps
│   ├── api   # Frontend application
│   └── web   # Backend API
└── packages  # Shared packages
```

## Getting Started

### Prerequisites

**Option 1: Using Nix + direnv (Recommended)**
- [Nix](https://nixos.org/) with flakes enabled
- [direnv](https://direnv.net/)

**Option 2: Manual Setup**
- [Bun](https://bun.com/) (latest)
- [Turborepo](https://turborepo.dev/) (latest)
- [Process Compose](https://github.com/F1bonacc1/process-compose) (recommended for development)

**DevOps + Containerization**
- Docker/Podman

### Installation

1. Set up the development environment

    **Option A: Using Nix + direnv (Recommended)**
  
    If you have direnv installed, allow the `.envrc` file to automatically load the Nix environment:
    ```sh
    direnv allow
    ```
    This will automatically install Bun, Turbo, Process Compose, and other deps into your dev shell whenever you're in the project directory.
    It will unload when you exit and restore your path and env vars.
  
    **Option B: Using Nix without direnv**
  
    ```sh
    nix develop
    ```
    You'll need to run this command each time you want to load the dev shell.
  
    **Option C: Manual Installation** - Install the required tools manually as listed in [Prerequisites](#prerequisites)

2. Install dependencies:
    ```sh
    bun install
    ```

3. Set up environment variables:

    Create a `.env` file in the `apps/api` directory and add the necessary environment variables (refer to `apps/api/.env.example`).
    
    Generate a Better Auth secret and add it to your `.env`:
    ```sh
    openssl rand -base64 32
    ```
    
    Similarly create a `.env` file in the `apps/web` directory. (Empty for now)

4. Set up the database:

    Create and run a PostgreSQL database, then push the schema using Drizzle ORM:
    ```sh
    cd apps/api
    bun run db:push
    ```

5. Seed the database with initial data:
    ```sh
    bun run db:seed
    bun run db:init-admin
    ```

### Running the Application

#### Run Everything (Frontend + Backend)

From the root directory:
```sh
bun run dev
```

This will start both the frontend and backend concurrently.

#### Run Frontend Only

```sh
cd apps/web
bun run dev
```

The frontend will be available at `http://localhost:3000`

#### Run Backend Only

```sh
cd apps/api
bun run dev
```

The API will be available at `http://localhost:5173`

## Development

### Database Management

- **Push schema changes**: `cd apps/api && bun run db:push`
- **Seed database**: `cd apps/api && bun run db:seed`
- **Initialize admin**: `cd apps/api && bun run db:init-admin`

### Code Quality

This project uses Biome for linting and formatting. Run checks with:
```sh
bun run check
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

`Thinkorswim` is licensed under the MIT License. See [LICENSE](LICENSE) for full details.
