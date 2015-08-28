import React from 'react/addons';
import { DragSource } from 'react-dnd';


const actionSource = {
    beginDrag(props) {
        return props.action;
    },

    endDrag(props, monitor, component) {
        const dropResult = monitor.getDropResult();
        if (!dropResult) {
            return;
        }

        const action = monitor.getItem();
        const newDate = dropResult.newDate;

        if (dropResult.onMoveAction) {
            dropResult.onMoveAction(action, newDate);
        }
    }
};

function collect(connect, monitor) {
    return {
        connectDragSource: connect.dragSource(),
        isDragging: monitor.isDragging()
    }
}

@DragSource('action', actionSource, collect)
export default class ActionItem extends React.Component {
    render() {
        const action = this.props.action;

        return this.props.connectDragSource(
            <li className="actionday-actionitem"
                onClick={ this.onClick.bind(this) }>
                <span className="activity">
                    { action.activity.title }</span>
                <span className="location">
                    { action.location.title }</span>
            </li>
        );
    }

    onClick(ev) {
        if (this.props.onClick) {
            this.props.onClick(this.props.action);
        }
    }
}

ActionItem.propTypes = {
    onClick: React.PropTypes.func,
    action: React.PropTypes.shape({
        id: React.PropTypes.string,
        location: React.PropTypes.object,
        activity: React.PropTypes.object
    }).isRequired
};