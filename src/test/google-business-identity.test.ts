import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  GOOGLE_BUSINESS_CID,
  GOOGLE_MAPS_EMBED_URL,
  GOOGLE_MAPS_PROFILE_URL,
  GOOGLE_REVIEW_URL,
} from "@/lib/googleBusiness";
import { ORGANIZATION_SAME_AS } from "@/lib/courseSchema";

/**
 * Every Google link points at the same listing, and it can be checked.
 *
 * Two of these were `maps.app.goo.gl/…` share links: opaque, so there was no
 * way to tell which place one opened, or a stale one from a good one, short of
 * following it — and one of the two was a second copy pasted into the
 * structured data, free to drift.
 *
 * Google's own identifier for the place is the CID, and it is sitting in the
 * map embed that has been live on the site all along, as the second half of
 * the `0x…:0x…` pair. The review link is not opaque either: `g.page/r/<key>`
 * base64url-decodes to a protobuf blob whose fixed64 field is that same CID.
 * So the identity is checkable arithmetically, which is what this file does,
 * and the profile link is written from the CID rather than pasted.
 */
const CID_HEX = "652fb90494e1566b";

describe("the Google Business listing", () => {
  it("has one CID, matching the hex in the live map embed", () => {
    expect(GOOGLE_BUSINESS_CID).toBe(String(BigInt("0x" + CID_HEX)));
    expect(GOOGLE_MAPS_EMBED_URL).toContain(`%3A0x${CID_HEX}!`);
  });

  it("builds the profile link from it instead of an opaque short link", () => {
    expect(GOOGLE_MAPS_PROFILE_URL).toBe(`https://www.google.com/maps?cid=${GOOGLE_BUSINESS_CID}`);
    expect(GOOGLE_MAPS_PROFILE_URL).not.toContain("goo.gl");
  });

  it("has a review link whose key decodes to the same CID", () => {
    const key = /g\.page\/r\/([^/]+)\/review$/.exec(GOOGLE_REVIEW_URL)?.[1];
    expect(key, "the review link must keep the g.page form that opens the review box").toBeTruthy();
    const bytes = Buffer.from(key!.replace(/-/g, "+").replace(/_/g, "/"), "base64");
    // 0x09 is protobuf field 1, wire type 1 (fixed64): the CID, little-endian.
    expect(bytes[0]).toBe(0x09);
    expect(bytes.subarray(1, 9).readBigUInt64LE(0)).toBe(BigInt("0x" + CID_HEX));
  });

  it("is listed once in the structured data, from the same constant", () => {
    const listing = ORGANIZATION_SAME_AS.filter((u) => u.includes("google.com/maps") || u.includes("goo.gl"));
    expect(listing).toEqual([GOOGLE_MAPS_PROFILE_URL]);
    // The literal that used to be pasted here is gone for good.
    expect(readFileSync(resolve(process.cwd(), "src/lib/courseSchema.ts"), "utf8")).not.toContain(
      '"https://maps.app.goo.gl',
    );
  });
});
