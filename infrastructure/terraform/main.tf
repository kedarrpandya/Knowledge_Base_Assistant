terraform {
  required_version = ">= 1.5.0"
  
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 3.75.0"
    }
    azuread = {
      source  = "hashicorp/azuread"
      version = "~> 2.45.0"
    }
  }

  backend "azurerm" {
    resource_group_name  = "terraform-state-rg"
    storage_account_name = "tfstateknowledgeassist"
    container_name       = "tfstate"
    key                  = "enterprise-knowledge-assistant.tfstate"
  }
}

provider "azurerm" {
  features {
    key_vault {
      purge_soft_delete_on_destroy    = false
      recover_soft_deleted_key_vaults = true
    }
    
    resource_group {
      prevent_deletion_if_contains_resources = false
    }
  }
}

provider "azuread" {}

# Local variables
locals {
  project_name = "knowledge-assistant"
  environment  = var.environment
  location     = var.location
  
  common_tags = {
    Project     = "Enterprise Knowledge Assistant"
    Environment = local.environment
    ManagedBy   = "Terraform"
    CostCenter  = var.cost_center
    Owner       = var.owner_email
  }
}

# Resource Group
resource "azurerm_resource_group" "main" {
  name     = "${local.project_name}-${local.environment}-rg"
  location = local.location
  tags     = local.common_tags
}

# Azure OpenAI Service
resource "azurerm_cognitive_account" "openai" {
  name                = "${local.project_name}-${local.environment}-openai"
  location            = local.location
  resource_group_name = azurerm_resource_group.main.name
  kind                = "OpenAI"
  sku_name            = var.openai_sku_name

  custom_subdomain_name = "${local.project_name}-${local.environment}-openai"
  
  public_network_access_enabled = false
  
  network_acls {
    default_action = "Deny"
    ip_rules       = var.allowed_ip_addresses
  }

  identity {
    type = "SystemAssigned"
  }

  tags = local.common_tags
}

# OpenAI GPT-4 Deployment
resource "azurerm_cognitive_deployment" "gpt4" {
  name                 = "gpt-4"
  cognitive_account_id = azurerm_cognitive_account.openai.id

  model {
    format  = "OpenAI"
    name    = "gpt-4"
    version = "turbo-2024-04-09"
  }

  sku {
    name     = "Standard"
    capacity = var.gpt4_capacity
  }
}

# OpenAI Embedding Deployment
resource "azurerm_cognitive_deployment" "embeddings" {
  name                 = "text-embedding-ada-002"
  cognitive_account_id = azurerm_cognitive_account.openai.id

  model {
    format  = "OpenAI"
    name    = "text-embedding-ada-002"
    version = "2"
  }

  sku {
    name     = "Standard"
    capacity = 10
  }
}

# Azure Cognitive Search
resource "azurerm_search_service" "main" {
  name                = "${local.project_name}-${local.environment}-search"
  resource_group_name = azurerm_resource_group.main.name
  location            = local.location
  sku                 = var.search_sku

  public_network_access_enabled = false
  
  identity {
    type = "SystemAssigned"
  }

  tags = local.common_tags
}

# Storage Account for Data Ingestion
resource "azurerm_storage_account" "main" {
  name                     = "${replace(local.project_name, "-", "")}${local.environment}sa"
  resource_group_name      = azurerm_resource_group.main.name
  location                 = local.location
  account_tier             = "Standard"
  account_replication_type = "GRS"
  
  enable_https_traffic_only       = true
  min_tls_version                 = "TLS1_2"
  allow_nested_items_to_be_public = false

  blob_properties {
    versioning_enabled = true
    
    delete_retention_policy {
      days = 30
    }
  }

  identity {
    type = "SystemAssigned"
  }

  tags = local.common_tags
}

# Storage Container for Documents
resource "azurerm_storage_container" "documents" {
  name                  = "knowledge-documents"
  storage_account_name  = azurerm_storage_account.main.name
  container_access_type = "private"
}

# Storage Container for Processed Data
resource "azurerm_storage_container" "processed" {
  name                  = "processed-documents"
  storage_account_name  = azurerm_storage_account.main.name
  container_access_type = "private"
}

# Key Vault
resource "azurerm_key_vault" "main" {
  name                       = "${local.project_name}-${local.environment}-kv"
  location                   = local.location
  resource_group_name        = azurerm_resource_group.main.name
  tenant_id                  = data.azurerm_client_config.current.tenant_id
  sku_name                   = "premium"
  soft_delete_retention_days = 90
  purge_protection_enabled   = true

  network_acls {
    default_action = "Deny"
    bypass         = "AzureServices"
    ip_rules       = var.allowed_ip_addresses
  }

  tags = local.common_tags
}

# Key Vault Access Policy for Current User
resource "azurerm_key_vault_access_policy" "deployer" {
  key_vault_id = azurerm_key_vault.main.id
  tenant_id    = data.azurerm_client_config.current.tenant_id
  object_id    = data.azurerm_client_config.current.object_id

  secret_permissions = [
    "Get", "List", "Set", "Delete", "Recover", "Backup", "Restore", "Purge"
  ]

  key_permissions = [
    "Get", "List", "Create", "Delete", "Update", "Recover", "Backup", "Restore", "Purge"
  ]
}

# Application Insights
resource "azurerm_log_analytics_workspace" "main" {
  name                = "${local.project_name}-${local.environment}-law"
  location            = local.location
  resource_group_name = azurerm_resource_group.main.name
  sku                 = "PerGB2018"
  retention_in_days   = 90

  tags = local.common_tags
}

resource "azurerm_application_insights" "main" {
  name                = "${local.project_name}-${local.environment}-ai"
  location            = local.location
  resource_group_name = azurerm_resource_group.main.name
  workspace_id        = azurerm_log_analytics_workspace.main.id
  application_type    = "web"

  tags = local.common_tags
}

# App Service Plan for Backend API
resource "azurerm_service_plan" "main" {
  name                = "${local.project_name}-${local.environment}-asp"
  location            = local.location
  resource_group_name = azurerm_resource_group.main.name
  os_type             = "Linux"
  sku_name            = var.app_service_sku

  tags = local.common_tags
}

# App Service for Backend API
resource "azurerm_linux_web_app" "api" {
  name                = "${local.project_name}-${local.environment}-api"
  location            = local.location
  resource_group_name = azurerm_resource_group.main.name
  service_plan_id     = azurerm_service_plan.main.id

  site_config {
    always_on = true
    
    application_stack {
      node_version = "18-lts"
    }

    cors {
      allowed_origins = var.allowed_cors_origins
    }
  }

  app_settings = {
    "APPLICATIONINSIGHTS_CONNECTION_STRING" = azurerm_application_insights.main.connection_string
    "AZURE_OPENAI_ENDPOINT"                = azurerm_cognitive_account.openai.endpoint
    "AZURE_OPENAI_DEPLOYMENT_NAME"         = azurerm_cognitive_deployment.gpt4.name
    "AZURE_SEARCH_ENDPOINT"                = "https://${azurerm_search_service.main.name}.search.windows.net"
    "AZURE_SEARCH_INDEX_NAME"              = "enterprise-knowledge-index"
    "AZURE_KEY_VAULT_URI"                  = azurerm_key_vault.main.vault_uri
    "NODE_ENV"                             = "production"
  }

  identity {
    type = "SystemAssigned"
  }

  https_only = true

  tags = local.common_tags
}

# Azure Functions for Data Ingestion
resource "azurerm_storage_account" "functions" {
  name                     = "${replace(local.project_name, "-", "")}${local.environment}funcsa"
  resource_group_name      = azurerm_resource_group.main.name
  location                 = local.location
  account_tier             = "Standard"
  account_replication_type = "LRS"

  tags = local.common_tags
}

resource "azurerm_service_plan" "functions" {
  name                = "${local.project_name}-${local.environment}-func-asp"
  location            = local.location
  resource_group_name = azurerm_resource_group.main.name
  os_type             = "Linux"
  sku_name            = "Y1"

  tags = local.common_tags
}

resource "azurerm_linux_function_app" "ingestion" {
  name                       = "${local.project_name}-${local.environment}-func"
  location                   = local.location
  resource_group_name        = azurerm_resource_group.main.name
  service_plan_id            = azurerm_service_plan.functions.id
  storage_account_name       = azurerm_storage_account.functions.name
  storage_account_access_key = azurerm_storage_account.functions.primary_access_key

  site_config {
    application_stack {
      node_version = "18"
    }

    application_insights_connection_string = azurerm_application_insights.main.connection_string
  }

  app_settings = {
    "AZURE_OPENAI_ENDPOINT"           = azurerm_cognitive_account.openai.endpoint
    "AZURE_SEARCH_ENDPOINT"           = "https://${azurerm_search_service.main.name}.search.windows.net"
    "AZURE_SEARCH_INDEX_NAME"         = "enterprise-knowledge-index"
    "STORAGE_CONNECTION_STRING"       = azurerm_storage_account.main.primary_connection_string
    "AZURE_KEY_VAULT_URI"             = azurerm_key_vault.main.vault_uri
  }

  identity {
    type = "SystemAssigned"
  }

  tags = local.common_tags
}

# Private Endpoints for Enhanced Security
resource "azurerm_virtual_network" "main" {
  name                = "${local.project_name}-${local.environment}-vnet"
  location            = local.location
  resource_group_name = azurerm_resource_group.main.name
  address_space       = ["10.0.0.0/16"]

  tags = local.common_tags
}

resource "azurerm_subnet" "private_endpoints" {
  name                 = "private-endpoints-subnet"
  resource_group_name  = azurerm_resource_group.main.name
  virtual_network_name = azurerm_virtual_network.main.name
  address_prefixes     = ["10.0.1.0/24"]
}

# Data Source
data "azurerm_client_config" "current" {}

# Store secrets in Key Vault
resource "azurerm_key_vault_secret" "openai_key" {
  name         = "openai-api-key"
  value        = azurerm_cognitive_account.openai.primary_access_key
  key_vault_id = azurerm_key_vault.main.id

  depends_on = [azurerm_key_vault_access_policy.deployer]
}

resource "azurerm_key_vault_secret" "search_key" {
  name         = "search-api-key"
  value        = azurerm_search_service.main.primary_key
  key_vault_id = azurerm_key_vault.main.id

  depends_on = [azurerm_key_vault_access_policy.deployer]
}

resource "azurerm_key_vault_secret" "storage_connection" {
  name         = "storage-connection-string"
  value        = azurerm_storage_account.main.primary_connection_string
  key_vault_id = azurerm_key_vault.main.id

  depends_on = [azurerm_key_vault_access_policy.deployer]
}

# RBAC Assignments
resource "azurerm_role_assignment" "api_openai" {
  scope                = azurerm_cognitive_account.openai.id
  role_definition_name = "Cognitive Services OpenAI User"
  principal_id         = azurerm_linux_web_app.api.identity[0].principal_id
}

resource "azurerm_role_assignment" "api_search" {
  scope                = azurerm_search_service.main.id
  role_definition_name = "Search Index Data Reader"
  principal_id         = azurerm_linux_web_app.api.identity[0].principal_id
}

resource "azurerm_role_assignment" "func_storage" {
  scope                = azurerm_storage_account.main.id
  role_definition_name = "Storage Blob Data Contributor"
  principal_id         = azurerm_linux_function_app.ingestion.identity[0].principal_id
}

# Key Vault Access for API
resource "azurerm_key_vault_access_policy" "api" {
  key_vault_id = azurerm_key_vault.main.id
  tenant_id    = data.azurerm_client_config.current.tenant_id
  object_id    = azurerm_linux_web_app.api.identity[0].principal_id

  secret_permissions = ["Get", "List"]
}

# Key Vault Access for Functions
resource "azurerm_key_vault_access_policy" "functions" {
  key_vault_id = azurerm_key_vault.main.id
  tenant_id    = data.azurerm_client_config.current.tenant_id
  object_id    = azurerm_linux_function_app.ingestion.identity[0].principal_id

  secret_permissions = ["Get", "List"]
}

