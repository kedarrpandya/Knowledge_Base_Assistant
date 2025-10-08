# PowerShell script to configure Azure AD for Knowledge Assistant
# Requires: Az PowerShell module and appropriate permissions

param(
    [Parameter(Mandatory=$true)]
    [string]$TenantId,
    
    [Parameter(Mandatory=$true)]
    [string]$SubscriptionId,
    
    [Parameter(Mandatory=$false)]
    [string]$AppName = "Enterprise Knowledge Assistant API"
)

# Connect to Azure AD
Write-Host "Connecting to Azure AD..." -ForegroundColor Cyan
Connect-AzAccount -TenantId $TenantId -SubscriptionId $SubscriptionId

# Create App Registration
Write-Host "Creating App Registration..." -ForegroundColor Cyan
$app = New-AzADApplication -DisplayName $AppName `
    -SignInAudience "AzureADMyOrg" `
    -IdentifierUris @("api://$($AppName.Replace(' ', '-').ToLower())")

Write-Host "App Registration created: $($app.AppId)" -ForegroundColor Green

# Create Service Principal
Write-Host "Creating Service Principal..." -ForegroundColor Cyan
$sp = New-AzADServicePrincipal -ApplicationId $app.AppId

Write-Host "Service Principal created: $($sp.Id)" -ForegroundColor Green

# Create Client Secret
Write-Host "Creating Client Secret..." -ForegroundColor Cyan
$secretDuration = New-TimeSpan -Days 365
$secret = New-AzADAppCredential -ObjectId $app.Id -EndDateTime (Get-Date).Add($secretDuration)

Write-Host "Client Secret created (save this securely, it won't be shown again):" -ForegroundColor Yellow
Write-Host $secret.SecretText -ForegroundColor Yellow

# Add API Permissions
Write-Host "Adding API Permissions..." -ForegroundColor Cyan

# Microsoft Graph User.Read
$graphResourceId = "00000003-0000-0000-c000-000000000000"
$userReadScope = "e1fe6dd8-ba31-4d61-89e7-88639da4683d"

Add-AzADAppPermission -ObjectId $app.Id `
    -ApiId $graphResourceId `
    -PermissionId $userReadScope `
    -Type Scope

Write-Host "API Permissions added" -ForegroundColor Green

# Define App Roles
Write-Host "Defining App Roles..." -ForegroundColor Cyan

$adminRole = @{
    AllowedMemberTypes = @("User")
    Description = "Administrators have full access to all features"
    DisplayName = "Administrator"
    Id = (New-Guid).Guid
    IsEnabled = $true
    Value = "Admin"
}

$managerRole = @{
    AllowedMemberTypes = @("User")
    Description = "Knowledge managers can manage documents and content"
    DisplayName = "Knowledge Manager"
    Id = (New-Guid).Guid
    IsEnabled = $true
    Value = "KnowledgeManager"
}

$analystRole = @{
    AllowedMemberTypes = @("User")
    Description = "Analysts can view analytics and reports"
    DisplayName = "Analyst"
    Id = (New-Guid).Guid
    IsEnabled = $true
    Value = "Analyst"
}

$userRole = @{
    AllowedMemberTypes = @("User")
    Description = "Standard users can query the knowledge base"
    DisplayName = "User"
    Id = (New-Guid).Guid
    IsEnabled = $true
    Value = "User"
}

$appRoles = @($adminRole, $managerRole, $analystRole, $userRole)

Update-AzADApplication -ObjectId $app.Id -AppRole $appRoles

Write-Host "App Roles defined" -ForegroundColor Green

# Output configuration
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "Azure AD Configuration Complete" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Application (Client) ID: $($app.AppId)" -ForegroundColor White
Write-Host "Tenant ID: $TenantId" -ForegroundColor White
Write-Host "Client Secret: $($secret.SecretText)" -ForegroundColor Yellow
Write-Host "Object ID: $($app.Id)" -ForegroundColor White
Write-Host "Service Principal ID: $($sp.Id)" -ForegroundColor White
Write-Host "`nAdd these to your environment variables:" -ForegroundColor Cyan
Write-Host "AZURE_AD_TENANT_ID=$TenantId"
Write-Host "AZURE_AD_CLIENT_ID=$($app.AppId)"
Write-Host "AZURE_AD_CLIENT_SECRET=$($secret.SecretText)"
Write-Host "`nIMPORTANT: Save the client secret securely - it cannot be retrieved later!" -ForegroundColor Red
Write-Host "========================================`n" -ForegroundColor Cyan

# Create configuration file
$config = @{
    tenantId = $TenantId
    clientId = $app.AppId
    objectId = $app.Id
    servicePrincipalId = $sp.Id
    appRoles = $appRoles
    timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
} | ConvertTo-Json -Depth 10

$configPath = "aad-config-$(Get-Date -Format 'yyyyMMdd-HHmmss').json"
$config | Out-File -FilePath $configPath

Write-Host "Configuration saved to: $configPath" -ForegroundColor Green

