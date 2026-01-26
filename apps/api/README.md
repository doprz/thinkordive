To install dependencies:
```sh
bun install
```

To run:
```sh
bun run dev
```

open http://localhost:3000

## API Design

### Authentication

```
POST   /api/auth/register             # Create new user account
POST   /api/auth/login                # Login and receive JWT
POST   /api/auth/logout               # Invalidate session
POST   /api/auth/refresh              # Refresh access token
GET    /api/auth/me                   # Get current user
```

### User

```
GET    /api/users/profile             # Get user profile
PUT    /api/users/profile             # Update profile
```

### Stocks

```
GET    /api/stocks                    # List all stocks (with filters)
GET    /api/stocks/:ticker            # Get stock details
GET    /api/stocks/:ticker/history    # Get price history
WS     /ws/stocks                     # Real-time price updates
```

### Orders

```
POST   /api/orders                    # Place new order (buy/sell)
GET    /api/orders                    # Get user's orders
GET    /api/orders/:id                # Get order details
DELETE /api/orders/:id                # Cancel pending order
```

### Portfolio

```
GET    /api/portfolio                 # Get current holdings
GET    /api/portfolio/summary         # Get portfolio summary with P&L
```

### Transactions

```
GET    /api/transactions              # Get transaction history
GET    /api/transactions/:id          # Get transaction details
```

### Cash

```
GET    /api/cash                      # Get cash balance
POST   /api/cash/deposit              # Deposit funds
POST   /api/cash/withdraw             # Withdraw funds
```

### Admin

```
POST   /api/admin/stocks              # Create new stock
PUT    /api/admin/stocks/:id          # Update stock
DELETE /api/admin/stocks/:id          # Delete stock

GET    /api/admin/market/settings     # Get market settings
PUT    /api/admin/market/hours        # Update market hours
GET    /api/admin/market/holidays     # List holidays
POST   /api/admin/market/holidays     # Add holiday
DELETE /api/admin/market/holidays/:id # Remove holiday
```
