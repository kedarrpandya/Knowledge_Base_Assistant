import * as appInsights from 'applicationinsights';
import { config } from '../config';
import { logger } from './logger';

let telemetryClient: appInsights.TelemetryClient | null = null;

export function initializeApplicationInsights(): void {
  if (!config.applicationInsights.connectionString) {
    logger.warn('Application Insights connection string not configured. Monitoring disabled.');
    return;
  }

  try {
    appInsights
      .setup(config.applicationInsights.connectionString)
      .setAutoDependencyCorrelation(true)
      .setAutoCollectRequests(true)
      .setAutoCollectPerformance(true, true)
      .setAutoCollectExceptions(true)
      .setAutoCollectDependencies(true)
      .setAutoCollectConsole(true)
      .setUseDiskRetryCaching(true)
      .setSendLiveMetrics(true)
      .setDistributedTracingMode(appInsights.DistributedTracingModes.AI_AND_W3C)
      .start();

    telemetryClient = appInsights.defaultClient;
    
    telemetryClient.context.tags[telemetryClient.context.keys.cloudRole] = 'knowledge-assistant-api';
    telemetryClient.context.tags[telemetryClient.context.keys.cloudRoleInstance] = process.env.WEBSITE_INSTANCE_ID || 'local';

    logger.info('Application Insights initialized successfully');
  } catch (error) {
    logger.error('Failed to initialize Application Insights', error);
  }
}

export function trackEvent(name: string, properties?: { [key: string]: string }, measurements?: { [key: string]: number }): void {
  if (telemetryClient) {
    telemetryClient.trackEvent({
      name,
      properties,
      measurements,
    });
  }
}

export function trackMetric(name: string, value: number, properties?: { [key: string]: string }): void {
  if (telemetryClient) {
    telemetryClient.trackMetric({
      name,
      value,
      properties,
    });
  }
}

export function trackException(exception: Error, properties?: { [key: string]: string }): void {
  if (telemetryClient) {
    telemetryClient.trackException({
      exception,
      properties,
    });
  }
  logger.error('Exception tracked', { error: exception.message, stack: exception.stack, ...properties });
}

export function trackDependency(
  name: string,
  commandName: string,
  duration: number,
  success: boolean,
  dependencyTypeName?: string
): void {
  if (telemetryClient) {
    telemetryClient.trackDependency({
      name,
      data: commandName,
      duration,
      success,
      dependencyTypeName: dependencyTypeName || 'HTTP',
    });
  }
}

export function trackRequest(
  name: string,
  url: string,
  duration: number,
  resultCode: string,
  success: boolean,
  properties?: { [key: string]: string }
): void {
  if (telemetryClient) {
    telemetryClient.trackRequest({
      name,
      url,
      duration,
      resultCode,
      success,
      properties,
    });
  }
}

export { telemetryClient };

