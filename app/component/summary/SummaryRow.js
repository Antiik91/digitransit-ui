import React from 'react';
import moment from 'moment';
import legTextUtil from '../../util/leg-text-util';
import geoUtils from '../../util/geo-utils';
import RouteNumber from '../departure/RouteNumber';
import cx from 'classnames';
import Icon from '../icon/icon';
import RelativeDuration from '../duration/relative-duration';

export default function SummaryRow() {
  let mode;
  const { data } = this.props;
  const startTime = moment(data.startTime);
  const endTime = moment(data.endTime);
  const duration = endTime.diff(startTime);
  const legs = [];
  let realTimeAvailable = false;
  let noTransitLegs = true;

  for (const leg of data.legs.entries()) {
    if (leg.transitLeg || leg.rentedBike) {
      if (noTransitLegs && leg.realTime) {
        realTimeAvailable = true;
      }

      noTransitLegs = false;
      break;
    }
  }

  let lastLegRented = false;

  for (const [i, leg] of data.legs.entries()) {
    if (leg.rentedBike && lastLegRented) {
      continue;
    }

    lastLegRented = leg.rentedBike;

    if (leg.transitLeg || leg.rentedBike || noTransitLegs) {
      ({ mode } = leg);

      if (leg.rentedBike) {
        mode = 'CITYBIKE';
      }

      legs.push(
        <RouteNumber
          key={i}
          mode={mode}
          text={legTextUtil.getLegText(leg)}
          vertical className={cx('line', mode.toLowerCase())}
        />);
    }
  }

  const classes = cx(['itinerary-summary-row', 'cursor-pointer', {
    passive: this.props.passive,
  }]);

  return (
    <div
      className={classes}
      onClick={() => this.props.onSelect(this.props.hash)}
    >
      <div className="itinerary-duration-and-distance">
        <div className="itinerary-duration">
          <RelativeDuration duration={duration} />
        </div>
        <div className="itinerary-walking-distance">
          <Icon img="icon-icon_walk" viewBox="6 0 40 40" />
          {geoUtils.displayDistance(data.walkDistance)}
        </div>
      </div>
      <div className={cx('itinerary-start-time', { 'realtime-available': realTimeAvailable })}>
        {startTime.format('HH:mm')}
      </div>
      <div className="itinerary-legs">
        {legs}
      </div>
      <div className="itinerary-end-time">
        {endTime.format('HH:mm')}
      </div>
      <div className="action-arrow">
        <Icon img="icon-icon_arrow-collapse--right" />
      </div>
    </div>);
}


SummaryRow.propTypes = {
  data: React.PropTypes.object.isRequired,
  passive: React.PropTypes.bool.isRequired,
  onSelect: React.PropTypes.func.isRequired,
  hash: React.PropTypes.string.isRequired,
};
