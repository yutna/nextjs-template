export { SwapiRequestError, SwapiValidationError } from "./errors";
export { getSwapiPeopleByIds } from "./get-swapi-people-by-ids";
export { getSwapiRoot } from "./get-swapi-root";
export { listSwapiFilms } from "./list-swapi-films";
export { listSwapiStarships } from "./list-swapi-starships";
export { searchSwapiPeople } from "./search-swapi-people";

export type { SwapiError } from "./errors";
export type {
  SwapiFilm,
  SwapiListResponse,
  SwapiPerson,
  SwapiRoot,
  SwapiStarship,
} from "./types";
