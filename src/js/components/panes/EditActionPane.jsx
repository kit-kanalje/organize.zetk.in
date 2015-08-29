import React from 'react/addons';

import PaneBase from './PaneBase';
import ActionForm from '../forms/ActionForm';


export default class EditActionPane extends PaneBase {
    componentDidMount() {
        this.listenTo('action', this.forceUpdate);
    }

    getRenderData() {
        var actionId = this.props.params[0];
        var actionStore = this.getStore('action');

        return {
            action: actionStore.getAction(actionId)
        }
    }

    getPaneTitle(data) {
        return 'Edit action';
    }

    renderPaneContent(data) {
        if (data.action) {
            return (
                <ActionForm ref="form" action={ data.action }
                    onCreateCampaign={ this.onCreateCampaign.bind(this) }
                    onCreateLocation={ this.onCreateLocation.bind(this) }
                    onCreateActivity={ this.onCreateActivity.bind(this) }
                    onSubmit={ this.onSubmit.bind(this) }/>
            );
        }
        else {
            // TODO: Show loading indicator?
            return null;
        }
    }

    onSubmit(ev) {
        ev.preventDefault();

        var values = this.refs.form.getChangedValues();
        var actionId = this.props.params[0];

        this.getActions('action').updateAction(actionId, values);
    }

    onCreateCampaign(title) {
        this.gotoSubPane('addcampaign', title);
    }

    onCreateLocation(title) {
        this.gotoSubPane('addlocation', title);
    }

    onCreateActivity(title) {
        this.gotoSubPane('addactivity', title);
    }
}
