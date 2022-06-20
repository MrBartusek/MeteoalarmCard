import Meteoalarm from './meteoalarm';
import MeteoFrance from './meteofrance';
import DWD from './dwd';
import Weatheralerts from './weatheralerts';
import NINA from './nina';
import EnvironmentCanada from './env_canada';
import BurzeDzisNet from './burze_dzis_net';

const INTEGRATIONS = [
	Meteoalarm,
	MeteoFrance,
	DWD,
	NINA,
	EnvironmentCanada,
	BurzeDzisNet,
	Weatheralerts
];

export default INTEGRATIONS;
