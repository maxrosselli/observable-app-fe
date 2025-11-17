import { ApplicationInsights } from '@microsoft/applicationinsights-web';
import { ReactPlugin } from '@microsoft/applicationinsights-react-js';

// Sostituisci questa stringa con la tua Instrumentation Key di Application Insights
const instrumentationKey = process.env.REACT_APP_APPINSIGHTS_INSTRUMENTATION_KEY || 'ba975d6e-b688-4d59-954c-8e74a80eb458';

// Debug: mostra la chiave utilizzata
console.log('Application Insights Key:', instrumentationKey);
console.log('Environment variable:', process.env.REACT_APP_APPINSIGHTS_INSTRUMENTATION_KEY);

const reactPlugin = new ReactPlugin();

const appInsights = new ApplicationInsights({
  config: {
    instrumentationKey: instrumentationKey,
    extensions: [reactPlugin],
    extensionConfig: {
      [reactPlugin.identifier]: { 
        history: null // Se usi React Router, passa qui l'history object
      }
    },
    disableFetchTracking: false,
    enableCorsCorrelation: true,
    enableRequestHeaderTracking: true,
    enableResponseHeaderTracking: true,
    autoTrackPageVisitTime: true,
    enableAjaxErrorStatusText: true,
    enableAjaxPerfTracking: true
  }
});

appInsights.loadAppInsights();

// Funzioni helper per il logging
export const trackEvent = (name, properties = {}, measurements = {}) => {
  appInsights.trackEvent({
    name,
    properties,
    measurements
  });
};

export const trackException = (error, properties = {}) => {
  appInsights.trackException({
    exception: error,
    properties
  });
};

export const trackTrace = (message, properties = {}) => {
  appInsights.trackTrace({
    message,
    properties
  });
};

export { appInsights, reactPlugin };