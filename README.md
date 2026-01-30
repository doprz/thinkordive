# thinkordive

A full-stack stock trading simulation platform where users can buy and sell stocks in a realistic market environment.

## Features

- **Customer Portal**: Buy/sell stocks, manage portfolio, and track transactions
- **Admin Dashboard**: Create stocks, manage market hours, and manage users
- **Real-time Price Engine**: Dynamic stock price fluctuations
- **Market Simulation**: Simulated market hours and holidays
- **User Authentication**: Secure login and registration

## Tech Stack

- **Frontend**: Tanstack Start, React, TypeScript, Tailwind CSS, Shadcn w/ Base UI, and SSR support
- **Backend**: Drizzle ORM and Better Auth
- **Database**: PostgreSQL
- **DevOps & Tooling**: Bun, Docker/Podman, Docker Compose, Process Compose, Biome, Nix, and EditorConfig
- **Deployment**: TBD

## Project Structure

This is a Tanstack Start project with the following structure:

```
src
├── components      # Components
│   └── ui          # Individual ui components
├── lib
├── middleware
├── routes
│   ├── api         # API routes
│   │   └── auth    # Auth routes
│   ├── index.tsx
│   ├── login.tsx
│   └── signup.tsx
└── server          # Database, schemas, and server functions
```

## Getting Started

### Prerequisites

**Option 1: Using Nix + direnv (Recommended)**
- [Nix](https://nixos.org/) with flakes enabled
- [direnv](https://direnv.net/)

**Option 2: Manual Setup**
- [Bun](https://bun.com/) (latest)
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
    This will automatically install Bun, Process Compose, and other deps into your dev shell whenever you're in the project directory.
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

    Create a `.env` file in the root directory and add the necessary environment variables (refer to `.env.example`).

    Generate a Better Auth secret and add it to your `.env`:
    ```sh
    openssl rand -base64 32
    ```

4. Set up the database:

    Create and run a PostgreSQL database:
    ```sh
    # Using Docker
    docker run --name drizzle-postgres -e POSTGRES_PASSWORD=mypassword -p 5432:5432 postgres

    # Or using Podman
    podman run --name drizzle-postgres -e POSTGRES_PASSWORD=mypassword -p 5432:5432 postgres
    ```
    Then push the schema using Drizzle ORM:
    ```sh
    bun run db:push
    ```

5. Seed the database with initial data:
    ```sh
    bun run db:seed
    bun run db:init-admin
    ```

### Running the Application

From the root directory (make sure the PostgreSQL container is running):
```sh
bun run dev
```

## Development

### Process Compose

Process Compose manages your development environment with automatic dependency handling:
- PostgreSQL runs in a Podman container with health checks
- Frontend/API starts after PostgreSQL is ready
- Optional processes (seeding, admin init, studio) can be enabled

### Code Quality

This project uses Biome for linting and formatting. Run checks with:
```sh
bun run check
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

`Thinkorswim` is licensed under the MIT License. See [LICENSE](LICENSE) for full details.
