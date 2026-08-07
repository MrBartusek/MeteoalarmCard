import BurzeDzisNet from './burze_dzis_net';
import DWD from './dwd';
import EnvironmentCanada from './env_canada';
import GeoSphereAustria from './geosphere_at';
import Meteoalarm from './meteoalarm';
import MeteoFrance from './meteofrance';
import NINA from './nina';
import Weatheralerts from './weatheralerts';

const INTEGRATIONS = [
	Meteoalarm,
	MeteoFrance,
	DWD,
	NINA,
	EnvironmentCanada,
	BurzeDzisNet,
	Weatheralerts,
	GeoSphereAustria,
];

export default INTEGRATIONS;
