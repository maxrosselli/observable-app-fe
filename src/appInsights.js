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

// Attendiamo che Application Insights sia completamente inizializzato
setTimeout(() => {
  if (!appInsights.context?.operation) {
    console.warn('Inizializzazione manuale del context di Application Insights');
    if (appInsights.context) {
      appInsights.context.operation = { id: generateGuid(), name: 'page-load' };
    }
  }
}, 100);

// Funzioni helper per il logging con operationId
export const trackEvent = (name, properties = {}, measurements = {}) => {
  const context = appInsights.context;
  appInsights.trackEvent({
    name,
    properties: {
      ...properties,
      operationId: context?.operation?.id || generateGuid(),
      operationName: context?.operation?.name || 'unknown',
      sessionId: context?.session?.id || 'unknown',
      userId: context?.user?.id || 'anonymous'
    },
    measurements
  });
};

export const trackException = (error, properties = {}) => {
  const context = appInsights.context;
  appInsights.trackException({
    exception: error,
    properties: {
      ...properties,
      operationId: context?.operation?.id || generateGuid(),
      operationName: context?.operation?.name || 'unknown',
      sessionId: context?.session?.id || 'unknown',
      userId: context?.user?.id || 'anonymous'
    }
  });
};

export const trackTrace = (message, properties = {}) => {
  const context = appInsights.context;
  appInsights.trackTrace({
    message,
    properties: {
      ...properties,
      operationId: context?.operation?.id || generateGuid(),
      operationName: context?.operation?.name || 'unknown',
      sessionId: context?.session?.id || 'unknown',
      userId: context?.user?.id || 'anonymous'
    }
  });
};

// Funzione per ottenere l'operationId corrente
export const getCurrentOperationId = () => {
  return appInsights.context?.operation?.id || generateGuid();
};

// Funzione per creare un nuovo operationId per una specifica operazione
export const startNewOperation = (operationName) => {
  // Inizializza il context se non esiste
  if (!appInsights.context) {
    console.warn('Application Insights context non inizializzato');
    return generateGuid();
  }
  
  // Inizializza operation se non esiste
  if (!appInsights.context.operation) {
    appInsights.context.operation = {};
  }
  
  const operationId = appInsights.context.operation.id || generateGuid();
  appInsights.context.operation.id = operationId;
  appInsights.context.operation.name = operationName;
  return operationId;
};

// Helper per generare GUID
const generateGuid = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

export { appInsights, reactPlugin };