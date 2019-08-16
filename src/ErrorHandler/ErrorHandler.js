import React, { Component } from 'react';


import errorTexts from '../Definitions/ErrorHandlerTexts';

class ErrorHandler extends Component {
    constructor(props) {
        super(props);
        const type = (this.props.type in errorTexts) ? this.props.type : 'generic';

        this.state = {
            errorOccurred: false,
            changeProp: this.props.changeProp,
            errorExplanation: errorTexts[type].errorExplanation,
            errorTitle: errorTexts[type].errorTitle,
            errorWorkaround: errorTexts[type].errorWorkaround,
        };

    }

    static getDerivedStateFromError(error) {
        console.log(error);
        return { errorOccurred: true, };
    }

    componentDidCatch(error, info) { }

    componentDidUpdate() {
        if (this.state.changeProp !== this.props.changeProp)
            this.setState({ errorOccurred: false, changeProp: this.props.changeProp, });
    }

    render() {
        if (this.state.errorOccurred) {
            return (
                <div className='error error-details'>
                    <h4>Oh no... Some mistake happened</h4>
                    <table><tbody>
                        <tr><th>What happened</th><td>{this.state.errorTitle}</td></tr>
                        <tr><th>Why did it happen</th><td>{this.state.errorExplanation}</td></tr>
                        <tr><th>What can you do</th><td>{this.state.errorWorkaround}</td></tr>
                    </tbody></table>
                </div>
            );
        } else {
            return this.props.children;
        }
    }
}

export default ErrorHandler;