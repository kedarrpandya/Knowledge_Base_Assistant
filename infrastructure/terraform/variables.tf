variable "environment" {
  description = "Environment name (dev, staging, production)"
  type        = string
  default     = "production"

  validation {
    condition     = contains(["dev", "staging", "production"], var.environment)
    error_message = "Environment must be dev, staging, or production."
  }
}

variable "location" {
  description = "Azure region for resources"
  type        = string
  default     = "eastus"
}

variable "cost_center" {
  description = "Cost center for billing"
  type        = string
  default     = "IT-AI-Platform"
}

variable "owner_email" {
  description = "Owner email for the resources"
  type        = string
}

variable "openai_sku_name" {
  description = "SKU for Azure OpenAI Service"
  type        = string
  default     = "S0"
}

variable "gpt4_capacity" {
  description = "Token capacity for GPT-4 deployment (in thousands)"
  type        = number
  default     = 30
}

variable "search_sku" {
  description = "SKU for Azure Cognitive Search"
  type        = string
  default     = "standard"

  validation {
    condition     = contains(["free", "basic", "standard", "standard2", "standard3"], var.search_sku)
    error_message = "Search SKU must be a valid Cognitive Search tier."
  }
}

variable "app_service_sku" {
  description = "SKU for App Service Plan"
  type        = string
  default     = "P1v3"
}

variable "allowed_ip_addresses" {
  description = "List of allowed IP addresses for network access"
  type        = list(string)
  default     = []
}

variable "allowed_cors_origins" {
  description = "Allowed CORS origins for the API"
  type        = list(string)
  default     = ["https://make.powerapps.com", "https://flow.microsoft.com"]
}

variable "aad_admin_group_id" {
  description = "Azure AD group ID for administrators"
  type        = string
  default     = ""
}

variable "enable_private_endpoints" {
  description = "Enable private endpoints for services"
  type        = bool
  default     = true
}

variable "log_retention_days" {
  description = "Number of days to retain logs"
  type        = number
  default     = 90

  validation {
    condition     = var.log_retention_days >= 30 && var.log_retention_days <= 730
    error_message = "Log retention must be between 30 and 730 days."
  }
}

variable "backup_retention_days" {
  description = "Number of days to retain backups"
  type        = number
  default     = 30
}

variable "enable_monitoring_alerts" {
  description = "Enable monitoring alerts"
  type        = bool
  default     = true
}

variable "alert_email_addresses" {
  description = "Email addresses to receive alerts"
  type        = list(string)
  default     = []
}

variable "tags" {
  description = "Additional tags for resources"
  type        = map(string)
  default     = {}
}

