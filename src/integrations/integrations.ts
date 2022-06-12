import Meteoalarm from './meteoalarm';
import MeteoFrance from './meteofrance';
import DWD from './dwd';
import Weatheralerts from './weatheralerts';
import NINA from './nina';

const INTEGRATIONS = [
	Meteoalarm,
	MeteoFrance,
	DWD,
	NINA,
	Weatheralerts
];

export default INTEGRATIONS;
