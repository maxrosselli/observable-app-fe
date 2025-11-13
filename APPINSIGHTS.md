# Configurazione Application Insights

## Setup
1. Nel portale Azure, vai alla tua risorsa Application Insights
2. Copia l'**Instrumentation Key** (o Connection String)
3. Aggiorna il file `.env` con la tua chiave:
   ```
   REACT_APP_APPINSIGHTS_INSTRUMENTATION_KEY=la-tua-chiave-qui
   ```

## Logs implementati

### Eventi tracciati:
- **SuccessButtonClick**: Click sul pulsante "Chiama Success"
- **ErrorButtonClick**: Click sul pulsante "Chiama Error"
- **ButtonClick**: Inizio di ogni chiamata API
- **APICallSuccess**: Chiamate API completate con successo
- **APICallError**: Chiamate API che hanno generato errori

### Proprietà tracciate:
- `endpoint`: Tipo di endpoint chiamato
- `buttonType`: Tipo di pulsante cliccato
- `timestamp`: Timestamp del click/evento
- `url`: URL completo della chiamata API
- `responseStatus`: Status code della risposta HTTP
- `errorMessage`: Messaggio di errore in caso di fallimento
- `duration`: Durata della chiamata API in millisecondi

### Metriche tracciate:
- `duration`: Tempo di risposta delle API in millisecondi
- `responseSize`: Dimensione della risposta in caratteri

### Tracce (Logs):
- Log di inizio chiamata API
- Log di successo con dettagli
- Log di errore con dettagli

## Visualizzazione in Azure
Nei log di Application Insights puoi usare queste query KQL:

```kql
// Eventi di click sui pulsanti
customEvents
| where name in ("SuccessButtonClick", "ErrorButtonClick")
| project timestamp, name, customDimensions

// Performance delle API
customEvents
| where name == "APICallSuccess"
| extend Duration = todouble(customMeasurements.duration)
| summarize avg(Duration), max(Duration), min(Duration) by tostring(customDimensions.endpoint)

// Errori delle API
exceptions
| union (customEvents | where name == "APICallError")
| project timestamp, name, customDimensions
```