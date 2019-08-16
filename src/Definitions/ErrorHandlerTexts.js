const errorTexts = {
    'ruleDetails': {
        error: 'Undefined Error',
        errorTitle: 'The data for the requested rule could not be parsed correctly',
        errorExplanation: 'That can happen for multiple reasons: (1) The rule got changed in between loading this page and displaying rule details which can currently lead to inconsistent rule-ids and errors. (2) There is some rule response/action/data I did have not seen before and hence did not anticipate. If you see this message for every rule, somthing basic seems to be broken',
        errorWorkaround: 'If the error is related to (1), you could try to reload the page. If that doesn\'t work, you need to view/edit the rule the old-fashined way. ',
    },
    'graph': {
        error: 'Undefined Error',
        errorTitle: 'The graph could not be drawn because some nodes/edges contain unexpected values',
        errorExplanation: 'This usually happens because loading some data failed or the loaded data contains unexpected properties',
        errorWorkaround: 'If it is because loading data failed, you can try reloading the page. Otherwise the graph is just broken',
    },
    'generic': {
        error: 'Undefined Error',
        errorTitle: 'Something went wrong',
        errorExplanation: 'Something major went wrong',
        errorWorkaround: 'I don\'t really know what happened, so I cannot tell you what to do..',
    },
};

export default errorTexts;