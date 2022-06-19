import Meteoalarm from './meteoalarm';
import MeteoFrance from './meteofrance';
import DWD from './dwd';
import Weatheralerts from './weatheralerts';
import NINA from './nina';
import EnvironmentCanada from './env_canada';

const INTEGRATIONS = [
	Meteoalarm,
	MeteoFrance,
	DWD,
	NINA,
	Weatheralerts,
	EnvironmentCanada
];

export default INTEGRATIONS;
