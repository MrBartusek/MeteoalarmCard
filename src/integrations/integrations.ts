import BurzeDzisNet from './burze_dzis_net';
import DWD from './dwd';
import EnvironmentCanada from './env_canada';
import Meteoalarm from './meteoalarm';
import MeteoFrance from './meteofrance';
import NINA from './nina';
import NWSAlerts from './nwsalerts';
import Weatheralerts from './weatheralerts';

const INTEGRATIONS = [
	BurzeDzisNet,
	DWD,
	EnvironmentCanada,
	Meteoalarm,
	MeteoFrance,
	NINA,
	NWSAlerts,
	Weatheralerts,
];

export default INTEGRATIONS;
