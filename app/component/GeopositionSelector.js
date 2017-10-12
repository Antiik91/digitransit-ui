import PropTypes from 'prop-types';
import React from 'react';
import connectToStores from 'fluxible-addons-react/connectToStores';
import { FormattedMessage } from 'react-intl';
import { routerShape, locationShape } from 'react-router';

import { startLocationWatch } from '../action/PositionActions';
import PositionStore from '../store/PositionStore';
import Icon from './Icon';
import { setUseCurrent } from '../action/EndpointActions';
import Loading from './Loading';

const GeopositionSelector = (
  { origin, status, searchModalIsOpen },
  context,
) => {
  /* States:
   * - locationing hasn't been started
   * . locationing in progress
   * . locationing denied
   * . locationing failed
   * - locationing succeeded
   */

  // sets origin to 'current locationä if search modal is not open
  if (
    (status === PositionStore.STATUS_FOUND_LOCATION ||
      status === PositionStore.STATUS_FOUND_ADDRESS) &&
    !searchModalIsOpen &&
    !origin.userSetPosition &&
    !origin.useCurrentPosition
  ) {
    context.executeAction(setUseCurrent, {
      target: 'origin',
      keepSelectedLocation: true, // don't overwrite if user has already set a location
      router: context.router,
      location: context.location,
    });
  }

  if (status === PositionStore.STATUS_NO_LOCATION) {
    return (
      <li>
        <button
          id="panel-locationing-button"
          className="noborder"
          tabIndex="0"
          onClick={() => context.executeAction(startLocationWatch)}
        >
          <Icon className="icon-positioning" img="icon-icon_position" />
          <FormattedMessage
            id="use-own-position"
            defaultMessage="Use current location"
          />
        </button>
      </li>
    );
  } else if (status === PositionStore.STATUS_SEARCHING_LOCATION) {
    return (
      <div id="geoposition-selector">
        <Loading />
        <div className="spinner-caption">
          <FormattedMessage
            id="splash-locating"
            defaultMessage="Detecting location"
          />…
        </div>
      </div>
    );
  }
  return null;
};

GeopositionSelector.propTypes = {
  status: PropTypes.string.isRequired,
  searchModalIsOpen: PropTypes.bool.isRequired,
  origin: PropTypes.object,
};

GeopositionSelector.contextTypes = {
  executeAction: PropTypes.func.isRequired,
  router: routerShape.isRequired,
  location: locationShape.isRequired,
};

export default connectToStores(
  GeopositionSelector,
  ['PositionStore', 'EndpointStore'],
  context => ({
    status: context.getStore('PositionStore').getLocationState().status,
    origin: context.getStore('EndpointStore').getOrigin(),
  }),
);
