const Config = {
    apiRoot: '/api',
    refDataApi: '/reference_data/',
    rulesApi: 'analytics/',
    ruleWizardBase: '/console/core/jsp/WizardFrame.jsp?action=edit&appName=qradar&pageId=rulewizard&ruleId=',
    newRuleWizardBase: '/console/core/jsp/WizardFrame.jsp?action=new&appName=qradar&pageId=rulewizard&type=',
    rulesSummary: 'https://159.8.30.116/console/do/rulewizard/maintainRules?dispatch=getAllRules&appName=qradar&pageId=RulesWizardExistingRules&summary=true',
    cepsSummary: 'https://159.8.30.116/console/do/core/genericsearchlist?appName=qradar&pageId=ArielPropertiesList',
    logSourcesSummary: 'https://159.8.30.116/console/do/core/genericsearchlist?appName=eventviewer&pageId=SensorDeviceList',
    aqlSearch: 'https://159.8.30.116/console/qradar/jsp/ArielSearchWrapper.jsp?' + encodeURI('url=do/ariel/arielSearch?'),
    aqlSearchDefaults: encodeURIComponent('appName=EventViewer&pageId=EventList&dispatch=performSearch&value(searchMode)=AQL&value(timeRangeType)=aqlTime&'),
    aqlSearchDefaultsFlow: encodeURIComponent('appName=Surveillance&pageId=FlowList&dispatch=performSearch&value(searchMode)=AQL&value(timeRangeType)=aqlTime&'),
    cepSearch: 'https://159.8.30.116/console/do/qradar/arielProperties?',
    cepSearchDefaults: 'appName=qradar&pageId=ArielPropertiesList&dispatch=edit&id=',
    popupSettings: 'status=yes,scrollbars=yes,resizable=yes,',
    axiosHeaders: { 'Authorization': 'Basic YWRtaW46WXVhZ3NIOERwNw==', 'Content-Type': 'text/plain', 'Version': '10.1', },

    colors: {
        cepForce: '#0530ad',
        cep: '#0062ff',
        lst: '#054719',
        bb: '#da1e28',
        rule: '#750e13',
        font: 'white',
        fontDisabled: 'lightgray',
        edge: '#a2b5ce',
        qradarBlue: '#4178be',
    },
    fontFace: '"IBM Helvetica Neue", "Helvetica Neue", Helvetica, Arial, Roboto, sans-serif',
};


export default Config;