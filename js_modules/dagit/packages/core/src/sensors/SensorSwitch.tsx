import {gql, useMutation} from '@apollo/client';
import * as React from 'react';

import {DISABLED_MESSAGE, usePermissions} from '../app/Permissions';
import {InstigationStatus} from '../types/globalTypes';
import {SwitchWithoutLabel} from '../ui/SwitchWithoutLabel';
import {Tooltip} from '../ui/Tooltip';
import {repoAddressToSelector} from '../workspace/repoAddressToSelector';
import {RepoAddress} from '../workspace/types';

import {
  displaySensorMutationErrors,
  START_SENSOR_MUTATION,
  STOP_SENSOR_MUTATION,
} from './SensorMutations';
import {SensorSwitchFragment} from './types/SensorSwitchFragment';
import {StartSensor} from './types/StartSensor';
import {StopSensor} from './types/StopSensor';

interface Props {
  large?: boolean;
  repoAddress: RepoAddress;
  sensor: SensorSwitchFragment;
}

export const SensorSwitch: React.FC<Props> = (props) => {
  const {large = true, repoAddress, sensor} = props;
  const {canStartSensor, canStopSensor} = usePermissions();

  const {jobOriginId, name, sensorState} = sensor;
  const {status} = sensorState;
  const sensorSelector = {
    ...repoAddressToSelector(repoAddress),
    sensorName: name,
  };

  const [startSensor, {loading: toggleOnInFlight}] = useMutation<StartSensor>(
    START_SENSOR_MUTATION,
    {onCompleted: displaySensorMutationErrors},
  );
  const [stopSensor, {loading: toggleOffInFlight}] = useMutation<StopSensor>(STOP_SENSOR_MUTATION, {
    onCompleted: displaySensorMutationErrors,
  });

  const onChangeSwitch = () => {
    if (status === InstigationStatus.RUNNING) {
      stopSensor({variables: {jobOriginId}});
    } else {
      startSensor({variables: {sensorSelector}});
    }
  };

  const running = status === InstigationStatus.RUNNING;

  if (canStartSensor && canStopSensor) {
    return (
      <SwitchWithoutLabel
        disabled={toggleOnInFlight || toggleOffInFlight}
        large={large}
        innerLabelChecked="on"
        innerLabel="off"
        checked={running || toggleOnInFlight}
        onChange={onChangeSwitch}
      />
    );
  }

  const lacksPermission = (running && !canStartSensor) || (!running && !canStopSensor);
  const disabled = toggleOffInFlight || toggleOnInFlight || lacksPermission;

  const switchElement = (
    <SwitchWithoutLabel
      disabled={disabled}
      large={large}
      innerLabelChecked="on"
      innerLabel="off"
      checked={running || toggleOnInFlight}
      onChange={onChangeSwitch}
    />
  );

  return lacksPermission ? (
    <Tooltip content={DISABLED_MESSAGE}>{switchElement}</Tooltip>
  ) : (
    switchElement
  );
};

export const SENSOR_SWITCH_FRAGMENT = gql`
  fragment SensorSwitchFragment on Sensor {
    id
    jobOriginId
    name
    sensorState {
      id
      status
    }
  }
`;
