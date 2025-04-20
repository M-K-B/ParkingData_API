import { getallData } from "../controllers/parkingDataController.ts";
import {
  assertArrayIncludes,
  assertEquals,
} from "https://deno.land/std/assert/mod.ts";

// Pick a few key fields from one known item
const mockData = [
  {
    "id": "bbea7a00-ee20-4966-9751-3ec7eaf8cdbd",
    "Restriction Type": "solo motorcycles",
    "Parking Spaces": 1,
    "Times Of Operation": "mon-sat 09:00-20:00",
    "Maximum Stay": "N/A",
    "Nearest Machine": "N/A",
    "Road Name": "Heath Street",
    "Postcode": "NW3 6TP",
    "Controlled Parking Zone": "CA-H",
    "Valid Parking Permits": "N/A",
    "Latitude": 51.555502,
    "Longitude": -0.178595,
    "Location": "0101000020E6100000CE531D7233DCC6BF696E85B01AC74940",
    "Image URL": null,
    "Last Uploaded": null,
    "Last Updated": "2025-04-16T23:34:32.787735+00:00",
    "Source": "official",
    "Notes": null,
  },
  {
    "id": "47181913-e68f-4d35-8fde-87be26ea7115",
    "Restriction Type": "permit holders only",
    "Parking Spaces": 5,
    "Times Of Operation": "mon-fri 08:30-18:30",
    "Maximum Stay": "N/A",
    "Nearest Machine": "N/A",
    "Road Name": "Rochester Square",
    "Postcode": "NW1 9SD",
    "Controlled Parking Zone": "CA-N",
    "Valid Parking Permits": "CA-N",
    "Latitude": 51.543387,
    "Longitude": -0.134834,
    "Location": "0101000020E61000004CC631923D42C1BF290989B48DC54940",
    "Image URL": null,
    "Last Uploaded": null,
    "Last Updated": "2025-04-16T23:34:32.787735+00:00",
    "Source": "official",
    "Notes": null,
  },
  {
    "id": "bb51111f-1b41-4d73-b1b8-efb44e965ddb",
    "Restriction Type": "permit holders only",
    "Parking Spaces": 1,
    "Times Of Operation": "mon-fri 08:30-18:30",
    "Maximum Stay": "N/A",
    "Nearest Machine": "N/A",
    "Road Name": "Greencroft Gardens",
    "Postcode": "NW6 3LL",
    "Controlled Parking Zone": "CA-R",
    "Valid Parking Permits": "CA-R",
    "Latitude": 51.543721,
    "Longitude": -0.183387,
    "Location": "0101000020E6100000897AC1A73979C7BFFF9254A698C54940",
    "Image URL": null,
    "Last Uploaded": null,
    "Last Updated": "2025-04-16T23:34:32.787735+00:00",
    "Source": "official",
    "Notes": null,
  },
  {
    "id": "1f5abe40-383d-48f3-aa97-6767c1d10f25",
    "Restriction Type": "disabled (dedicated)",
    "Parking Spaces": 1,
    "Times Of Operation": "at any time",
    "Maximum Stay": "N/A",
    "Nearest Machine": "N/A",
    "Road Name": "Kingsgate Road",
    "Postcode": "NW6 4TB",
    "Controlled Parking Zone": "CA-Q",
    "Valid Parking Permits": "N/A",
    "Latitude": 51.540554,
    "Longitude": -0.19503,
    "Location": "0101000020E61000009F93DE37BEF6C8BF6ADC9BDF30C54940",
    "Image URL": null,
    "Last Uploaded": null,
    "Last Updated": "2025-04-16T23:34:32.787735+00:00",
    "Source": "official",
    "Notes": null,
  },
  {
    "id": "910a5fec-613d-4320-9baf-d65ca8e2cf87",
    "Restriction Type": "permit holders ev charging only",
    "Parking Spaces": 1,
    "Times Of Operation": "at any time",
    "Maximum Stay": "12 hours",
    "Nearest Machine": "N/A",
    "Road Name": "Lawford Road",
    "Postcode": "NW5 2LN",
    "Controlled Parking Zone": "CA-M",
    "Valid Parking Permits": "CA-M",
    "Latitude": 51.546408,
    "Longitude": -0.137382,
    "Location": "0101000020E6100000AC8F87BEBB95C1BFEA2285B2F0C54940",
    "Image URL": null,
    "Last Uploaded": null,
    "Last Updated": "2025-04-16T23:34:32.787735+00:00",
    "Source": "official",
    "Notes": null,
  },
];

const mockSupabase = {
  from: (_: string) => ({
    select: (_: string) => ({
      data: mockData,
      error: null,
    }),
  }),
};

Deno.test("getallData returns expected restriction items", async () => {
  const ctx: any = { response: {} };

  await getallData(ctx);

  assertEquals(ctx.response.status, 200);
  assertEquals(Array.isArray(ctx.response.body), true);
  assertArrayIncludes(ctx.response.body, mockData);
});
