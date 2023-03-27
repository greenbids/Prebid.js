import {deepClone, logError, logInfo, mergeDeep} from 'src/utils';
import { ajax } from 'src/ajax';
import { getGlobal } from 'src/prebidGlobal';
import { submodule } from 'src/hook';
import { config } from 'src/config';

const MODULE_NAME = 'greenbidsRtdModule';

const ENDPOINT = 'https://europe-west2-greenbids-357713.cloudfunctions.net/publisher-analytics-endpoint';

function alterBidRequests(reqBidsConfigObj, callback, config, userConsent) {
  const params = config.params;
  const pbuid = params.pbuid;

  let promise = new Promise((resolve) => {
    const timeoutId = setTimeout(() => resolve(reqBidsConfigObj), 100);
    ajax(ENDPOINT, {
      success: (response) => {
        logInfo(JSON.stringify(response));
        clearTimeout(timeoutId);
        const proceed = JSON.parse("false");

        if (!proceed) {
          reqBidsConfigObj.adUnits.forEach((adUnit) => {
            adUnit.bids = adUnit.bids.filter(bidrequest => !(bidrequest.bidder === "appnexus"));
          });
        }
      },
      error: () => clearTimeout(timeoutId)
    }, JSON.stringify({
      'pbuid': pbuid
    }), { method: 'POST', contentType: 'application/json'});});
  promise.then(()=>callback());
}

submodule('realTimeData', {
  name: MODULE_NAME,
  init: () => true,
  getBidRequestData: alterBidRequests,
});
