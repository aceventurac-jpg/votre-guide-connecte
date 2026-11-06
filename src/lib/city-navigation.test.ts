import { describe, expect, test } from "vitest";
import { moveTowner, nearbyPortal, SHOPPING_CENTRES } from "./city-navigation";
describe("City navigation", () => {
  test("movement keeps the character on the promenade", () => {
    expect(moveTowner(60, 735, -1, -1, 1)).toEqual({ x: 60, y: 735 });
    expect(moveTowner(1860, 955, 1, 1, 1)).toEqual({ x: 1860, y: 955 });
  });
  test("the centre entrance is reachable, distant entrances are not", () => {
    expect(nearbyPortal(1180, 775)?.id).toBe("mall");
    expect(nearbyPortal(1180, 955)).toBeUndefined();
  });
  test("Leers is the initial French centre and Belgium has a separate territory", () => {
    expect(SHOPPING_CENTRES[0].city).toBe("Leers");
    expect(SHOPPING_CENTRES[0].country).toBe("France");
    expect(SHOPPING_CENTRES[1].country).toBe("Belgique");
  });
});