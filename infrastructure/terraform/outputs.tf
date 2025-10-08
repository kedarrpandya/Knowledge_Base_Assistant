output "resource_group_name" {
  description = "Name of the resource group"
  value       = azurerm_resource_group.main.name
}

output "openai_endpoint" {
  description = "Azure OpenAI endpoint URL"
  value       = azurerm_cognitive_account.openai.endpoint
  sensitive   = false
}

output "openai_deployment_name" {
  description = "GPT-4 deployment name"
  value       = azurerm_cognitive_deployment.gpt4.name
}

output "search_endpoint" {
  description = "Azure Cognitive Search endpoint"
  value       = "https://${azurerm_search_service.main.name}.search.windows.net"
}

output "search_service_name" {
  description = "Azure Cognitive Search service name"
  value       = azurerm_search_service.main.name
}

output "api_url" {
  description = "Backend API URL"
  value       = "https://${azurerm_linux_web_app.api.default_hostname}"
}

output "api_identity_principal_id" {
  description = "Managed identity principal ID for API"
  value       = azurerm_linux_web_app.api.identity[0].principal_id
}

output "function_app_name" {
  description = "Azure Function App name"
  value       = azurerm_linux_function_app.ingestion.name
}

output "storage_account_name" {
  description = "Storage account name for documents"
  value       = azurerm_storage_account.main.name
}

output "key_vault_uri" {
  description = "Key Vault URI"
  value       = azurerm_key_vault.main.vault_uri
  sensitive   = false
}

output "application_insights_connection_string" {
  description = "Application Insights connection string"
  value       = azurerm_application_insights.main.connection_string
  sensitive   = true
}

output "application_insights_instrumentation_key" {
  description = "Application Insights instrumentation key"
  value       = azurerm_application_insights.main.instrumentation_key
  sensitive   = true
}

output "log_analytics_workspace_id" {
  description = "Log Analytics workspace ID"
  value       = azurerm_log_analytics_workspace.main.id
}

output "deployment_summary" {
  description = "Summary of deployed resources"
  value = {
    environment          = var.environment
    location             = var.location
    resource_group       = azurerm_resource_group.main.name
    openai_endpoint      = azurerm_cognitive_account.openai.endpoint
    search_endpoint      = "https://${azurerm_search_service.main.name}.search.windows.net"
    api_url              = "https://${azurerm_linux_web_app.api.default_hostname}"
    function_app         = azurerm_linux_function_app.ingestion.name
    key_vault            = azurerm_key_vault.main.name
  }
}

# Configuration file for easy reference
output "configuration_yaml" {
  description = "Configuration in YAML format"
  value = <<-EOT
    azure:
      subscription_id: ${data.azurerm_client_config.current.subscription_id}
      resource_group: ${azurerm_resource_group.main.name}
      location: ${var.location}
    
    openai:
      endpoint: ${azurerm_cognitive_account.openai.endpoint}
      deployment: ${azurerm_cognitive_deployment.gpt4.name}
      embedding_deployment: ${azurerm_cognitive_deployment.embeddings.name}
    
    cognitive_search:
      endpoint: https://${azurerm_search_service.main.name}.search.windows.net
      service_name: ${azurerm_search_service.main.name}
      index_name: enterprise-knowledge-index
    
    backend_api:
      url: https://${azurerm_linux_web_app.api.default_hostname}
      app_name: ${azurerm_linux_web_app.api.name}
    
    function_app:
      name: ${azurerm_linux_function_app.ingestion.name}
    
    storage:
      account_name: ${azurerm_storage_account.main.name}
      documents_container: ${azurerm_storage_container.documents.name}
      processed_container: ${azurerm_storage_container.processed.name}
    
    key_vault:
      name: ${azurerm_key_vault.main.name}
      uri: ${azurerm_key_vault.main.vault_uri}
    
    monitoring:
      app_insights: ${azurerm_application_insights.main.name}
      log_analytics: ${azurerm_log_analytics_workspace.main.name}
  EOT
}

