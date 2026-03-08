import "dayjs/locale/th";

import _dayjs from "dayjs";
import buddhistEra from "dayjs/plugin/buddhistEra";
import customParseFormat from "dayjs/plugin/customParseFormat";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";

import { TIME_ZONE } from "@/shared/constants/timezone";

_dayjs.extend(utc);
_dayjs.extend(timezone);
_dayjs.extend(buddhistEra);
_dayjs.extend(customParseFormat);
_dayjs.locale("th");
_dayjs.tz.setDefault(TIME_ZONE);

export const dayjs = _dayjs;
