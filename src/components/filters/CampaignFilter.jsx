import React from 'react';
import { connect } from 'react-redux';

import FilterBase from './FilterBase';
import Form from '../forms/Form';
import DateInput from '../forms/inputs/DateInput';
import SelectInput from '../forms/inputs/SelectInput';
import RelSelectInput from '../forms/inputs/RelSelectInput';
import { retrieveCampaigns } from '../../actions/campaign';

const OPERATOR_OPTIONS = {
    'in_spec': 'Participate in specific campaign',
    'in_any': 'Participate in any campaign',
    'notin_spec': 'Do not participate in specific campaign',
    'notin_any': 'Do not participate in any campaigns',
};

const DATE_OPTIONS = {
    'any': 'at any point in time',
    'future': 'in the future',
    'past': 'in the past',
    'after': 'after',
    'before': 'before',
    'between': 'between',
};


@connect(state => ({ campaigns: state.campaigns }))
export default class CampaignFilter extends FilterBase {
    constructor(props) {
        super(props);

        this.state = stateFromConfig(props.config);
    }

    componentWillReceiveProps(nextProps) {
        this.setState(stateFromConfig(nextProps.config));
    }

    componentDidMount() {
        let campaignList = this.props.campaigns.campaignList;

        if (campaignList.items.length == 0 && !campaignList.isPending) {
            this.props.dispatch(retrieveCampaigns());
        }
    }

    renderFilterForm(config) {
        let campaignStore = this.props.campaigns;
        let campaigns = campaignStore.campaignList.items.map(i => i.data);
        let timeframe = this.state.timeframe;

        let campaignSelect = null;
        if (this.state.op == 'in_spec' || this.state.op == 'notin_spec') {
            campaignSelect = (
                <RelSelectInput name="campaign" label="Which campaign?"
                    objects={ campaigns } value={ this.state.campaign }
                    onValueChange={ this.onChangeSimpleField.bind(this) }
                    showCreateOption={ false }/>
            );
        }

        let afterInput = null;
        if (timeframe == 'after' || timeframe == 'between') {
            afterInput = (
                <DateInput key="after" name="after"
                    className="CampaignFilter-after"
                    value={ this.state.after }
                    onValueChange={ this.onChangeSimpleField.bind(this) }/>
            );
        }

        let beforeInput = null;
        if (timeframe == 'before' || timeframe == 'between') {
            beforeInput = (
                <DateInput key="before" name="before"
                    className="CampaignFilter-before"
                    value={ this.state.before }
                    onValueChange={ this.onChangeSimpleField.bind(this) }/>
            );
        }

        return [
            <SelectInput key="operator" name="operator"
                label="Match people who"
                options={ OPERATOR_OPTIONS } value={ this.state.op }
                onValueChange={ this.onSelectOperator.bind(this) }/>,

            campaignSelect,

            <SelectInput key="timeframe" name="timeframe"
                options={ DATE_OPTIONS } value={ this.state.timeframe }
                onValueChange={ this.onSelectTimeframe.bind(this) }/>,

            afterInput,
            beforeInput,
        ];
    }

    getConfig() {
        let opFields = this.state.op.split('_');

        return {
            operator: opFields[0],
            campaign: (opFields[1] == 'spec')? this.state.campaign : null,
            before: this.state.before,
            after: this.state.after,
        };
    }

    onChangeSimpleField(name, value) {
        let state = {};
        state[name] = value;
        this.setState(state, () => this.onConfigChange());
    }

    onSelectOperator(name, value) {
        if (value == 'in_any' || value == 'notin_any') {
            this.setState({ op: value, campaign: null }, () =>
                this.onConfigChange());
        }
        else {
            // Don't fire event for "spec" operators until a campaign
            // has actually been selected.
            this.setState({ op: value });
        }
    }

    onSelectTimeframe(name, value) {
        let before = undefined;
        let after = undefined;
        let today = Date.utc.create().format('{yyyy}-{MM}-{dd}');

        switch (value) {
            case 'future':
                after = 'now';
                break;
            case 'past':
                before = 'now';
                break;
            case 'after':
                after = today;
                break;
            case 'before':
                before = today;
                break;
            case 'between':
                after = today;
                before = (30).daysAfter(today).format('{yyyy}-{MM}-{dd}');
                break;
        }

        this.setState({ timeframe: value, before, after }, () =>
            this.onConfigChange());
    }
}

function stateFromConfig(config) {
    let opPrefix = config.operator || 'in';
    let opSuffix = config.campaign? 'spec' : 'any';

    let state = {
        op: opPrefix + '_' + opSuffix,
        campaign: config.campaign,
        before: config.before,
        after: config.after,
    }

    state.timeframe = 'any';
    if (config.before && config.after) {
        state.timeframe = 'between';
    }
    else if (config.before == 'now') {
        state.timeframe = 'past';
    }
    else if (config.before) {
        state.timeframe = 'before';
    }
    else if (config.after == 'now') {
        state.timeframe = 'future';
    }
    else if (config.after) {
        state.timeframe = 'after';
    }

    return state;
}