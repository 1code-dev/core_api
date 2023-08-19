# Step 1: Navigate to parent directory
Set-Location .

# Step 2: Set NODE_ENV to 'dev'
$env:NODE_ENV = 'dev'

# Step 3: Echo environment is set
Write-Host "Environment is set to 'dev'"

# Step 4: Open Swagger UI in the default browser
Start-Process "http://localhost:1112/docs"

# Step 5: Run npm run start:dev
npm run start:dev