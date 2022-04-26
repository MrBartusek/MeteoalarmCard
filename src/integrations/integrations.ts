import Meteoalarm from './meteoalarm';
import MeteoFrance from './meteofrance';
import DWDIntegration from './dwd';
import Weatheralerts from './weatheralerts';

const INTEGRATIONS = [
	Meteoalarm,
	MeteoFrance,
	DWDIntegration,
	Weatheralerts
];

export default INTEGRATIONS;
