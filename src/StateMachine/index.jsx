import React, { useEffect } from 'react';
import _ from 'lodash';
import { useMachine } from '@xstate/react';
import useReactRouter from 'use-react-router';
import { makeMachine, resolveState } from "../machine";

export const StateMachine = ({ children }) => {
    const { location, match, history } = useReactRouter();
    const machine = makeMachine(history)
    const [current, send, service] = useMachine(machine);
    
    // Look at the meta.path property across all states to identify a match
    const nextStateNode = resolveState(machine, {
        locationPath: location.pathname,
        locationParams: match.params,
    });

    useEffect(() => {
        if (current.value === 'AWAITING_INITIAL_STATE') {
            // Activate the initial state if resolved
            if (nextStateNode) {
                send('ACTIVATE_STATE', { state: nextStateNode.id });
            }
        }
    })

    const currentStateNodePath = _.last(current.toStrings());

    const components = current.toStrings()
        .map(stateNodePath => {
            return _.get(current, ['meta', `${machine.id}.${stateNodePath}`, 'Component']);
        })
        .filter(Component => !!Component)

    const paths = current.toStrings()
        .map(stateNodePath => {
            return _.get(current, ['meta', `${machine.id}.${stateNodePath}`, 'path']);
        })
        .filter(path => !!path)

    const Component = _.last(components);
    const path = _.last(paths);

    useEffect(() => {
        if (current.value !== 'AWAITING_INITIAL_STATE' && path && history.location.pathname !== path) {
            history.replace({ pathname: path });
        }
    })

    if (current.value === 'AWAITING_INITIAL_STATE') {
        // Next state queued up? Let's wait for the transition
        if (nextStateNode) {
            return <div>Loading...</div>
        }

        // No state found for resolution? Fallback to render children (<Routes />)
        return <>{children}</>;
    }

    // TODO: What about states/substates without components? Need to find the first component along the path and render that.
    if (!Component) {
        // TODO: ERROR! Every machine state must map to a Component
        return null;
    }

    const onNext = current.nextEvents.includes('NEXT') && (() => send('NEXT'))
    const onBack = current.nextEvents.includes('BACK') && (() => send('BACK'))

    // Render the component associated with the current state
    return (
        <div>
            <div>
                {currentStateNodePath}
            </div>
            <Component />
            <div>
                {onBack && <button onClick={onBack}>Back</button>}
                {onNext && <button onClick={onNext}>Next</button>}
            </div>
        </div>
    )
};